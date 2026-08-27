const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { getCreditPackage } = require('../config/creditPackages.config');
const { criarPreferencia, consultarPagamento } = require('./mercadoPago.service');
const { concederCreditos, revogarCreditosCompra } = require('./credit.service');

function paymentStatus(status) {
    const map = {
        approved: 'APPROVED',
        pending: 'PENDING',
        in_process: 'PENDING',
        rejected: 'REJECTED',
        cancelled: 'CANCELLED',
        refunded: 'REFUNDED',
        charged_back: 'CHARGEBACK',
    };
    return map[status] || 'UNKNOWN';
}

async function criarCompra(userId, packageId) {
    const packageData = getCreditPackage(packageId);
    if (!packageData) {
        const error = new Error('Pacote de créditos inválido.');
        error.status = 400;
        throw error;
    }

    const purchaseId = crypto.randomUUID();
    const externalReference = `redapro:${purchaseId}`;
    const purchase = await prisma.purchase.create({
        data: {
            id: purchaseId,
            userId,
            packageId: packageData.id,
            credits: packageData.credits,
            amountCents: packageData.amountCents,
            externalReference,
        },
    });

    try {
        const preference = await criarPreferencia({ purchaseId, packageData });
        return prisma.purchase.update({
            where: { id: purchase.id },
            data: { preferenceId: preference.id },
            select: { id: true, preferenceId: true, status: true, packageId: true, credits: true, amountCents: true },
        }).then((result) => ({
            ...result,
            checkoutUrl: preference.init_point,
        }));
    } catch (error) {
        await prisma.purchase.update({ where: { id: purchase.id }, data: { status: 'CANCELLED' } }).catch(() => {});
        throw error;
    }
}

async function processarPagamentoWebhook(paymentId) {
    console.log(`[PAYMENT] Iniciando processamento do pagamento ${paymentId}`);
    
    const remotePayment = await consultarPagamento(paymentId);
    console.log(`[PAYMENT] Dados recebidos do Mercado Pago:`, {
        id: remotePayment.id,
        status: remotePayment.status,
        external_reference: remotePayment.external_reference,
        transaction_amount: remotePayment.transaction_amount,
        currency_id: remotePayment.currency_id
    });

    const externalReference = remotePayment.external_reference;
    if (typeof externalReference !== 'string' || !externalReference.startsWith('redapro:')) {
        const error = new Error('Pagamento sem referência interna válida.');
        error.status = 400;
        console.error(`[PAYMENT] Erro de referência:`, externalReference);
        throw error;
    }

    const purchaseId = externalReference.slice('redapro:'.length);
    console.log(`[PAYMENT] PurchaseId extraído: ${purchaseId}`);
    
    const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId } });
    if (!purchase) {
        const error = new Error('Compra não encontrada.');
        error.status = 404;
        console.error(`[PAYMENT] Compra não encontrada: ${purchaseId}`);
        throw error;
    }
    
    console.log(`[PAYMENT] Compra encontrada:`, {
        id: purchase.id,
        userId: purchase.userId,
        credits: purchase.credits,
        amountCents: purchase.amountCents,
        currency: purchase.currency
    });

    const status = paymentStatus(remotePayment.status);
    const amountCents = Math.round(Number(remotePayment.transaction_amount) * 100);
    const currency = remotePayment.currency_id || 'BRL';
    
    console.log(`[PAYMENT] Validando valores:`, {
        remoteAmountCents: amountCents,
        purchaseAmountCents: purchase.amountCents,
        remoteCurrency: currency,
        purchaseCurrency: purchase.currency,
        match: amountCents === purchase.amountCents && currency === purchase.currency
    });
    
    if (amountCents !== purchase.amountCents || currency !== purchase.currency) {
        const error = new Error('Valor ou moeda do pagamento não conferem.');
        error.status = 400;
        console.error(`[PAYMENT] Valores não conferem`, error);
        throw error;
    }

    const payment = await prisma.$transaction(async (tx) => {
        const existing = await tx.payment.findUnique({ where: { mercadoPagoPaymentId: String(remotePayment.id) } });
        if (existing && (existing.purchaseId !== purchase.id || existing.userId !== purchase.userId)) {
            const error = new Error('Pagamento associado a outra compra.');
            error.status = 409;
            console.error(`[PAYMENT] Pagamento conflitante:`, existing);
            throw error;
        }
        const saved = existing
            ? await tx.payment.update({
                where: { id: existing.id },
                data: { status, statusDetail: remotePayment.status_detail || null, amountCents, currency, approvedAt: status === 'APPROVED' ? new Date() : null },
            })
            : await tx.payment.create({
                data: {
                    userId: purchase.userId,
                    purchaseId: purchase.id,
                    mercadoPagoPaymentId: String(remotePayment.id),
                    status,
                    statusDetail: remotePayment.status_detail || null,
                    amountCents,
                    currency,
                    approvedAt: status === 'APPROVED' ? new Date() : null,
                },
            });

        if (status !== 'UNKNOWN') {
            await tx.purchase.update({ where: { id: purchase.id }, data: { status } });
        }
        console.log(`[PAYMENT] Payment ${existing ? 'atualizado' : 'criado'}:`, { id: saved.id, status: saved.status });
        return saved;
    });

    // Só processa concessão de créditos se status for APPROVED
    if (status === 'APPROVED') {
        console.log(`[PAYMENT] Status APPROVED - verificando se créditos já foram concedidos para ${purchase.id}`);
        const alreadyGranted = await prisma.creditLot.findUnique({ where: { purchaseId: purchase.id } });
        if (!alreadyGranted) {
            console.log(`[PAYMENT] Créditos não concedidos ainda. Concedendo ${purchase.credits} créditos para userId ${purchase.userId}`);
            try {
                await concederCreditos({ userId: purchase.userId, purchaseId: purchase.id, credits: purchase.credits });
                console.info(`[PAYMENT] ✓ Pagamento ${payment.id} aprovado; ${purchase.credits} créditos concedidos para userId ${purchase.userId}`);
            } catch (error) {
                console.error(`[PAYMENT] Erro ao conceder créditos:`, {
                    message: error.message,
                    code: error.code,
                    status: error.status,
                    stack: error.stack
                });
                if (error.code !== 'P2002') throw error;
                console.warn(`[PAYMENT] P2002 capturado (já existe), ignorando`);
            }
        } else {
            console.log(`[PAYMENT] Créditos já foram concedidos anteriormente: ${alreadyGranted.id}`);
        }
    } else if (['REFUNDED', 'CHARGEBACK', 'CANCELLED'].includes(status)) {
        await revogarCreditosCompra(purchase.id);
        console.log(`[PAYMENT] Créditos restantes revogados para a compra ${purchase.id}`);
    } else {
        console.log(`[PAYMENT] Status ${status} - créditos NÃO serão concedidos`);
    }

    return payment;
}

module.exports = { criarCompra, processarPagamentoWebhook };
