const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { getCreditPackage } = require('../config/creditPackages.config');
const { criarPreferencia, consultarPagamento } = require('./mercadoPago.service');
const { concederCreditos } = require('./credit.service');

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
        const isTestToken = process.env.MERCADO_PAGO_ACCESS_TOKEN?.startsWith('TEST-');
        const checkoutUrl = (isTestToken && preference.sandbox_init_point)
            ? preference.sandbox_init_point
            : (preference.init_point || preference.sandbox_init_point);

        return prisma.purchase.update({
            where: { id: purchase.id },
            data: { preferenceId: preference.id },
            select: { id: true, preferenceId: true, status: true, packageId: true, credits: true, amountCents: true },
        }).then((result) => ({
            ...result,
            checkoutUrl,
        }));
    } catch (error) {
        await prisma.purchase.update({ where: { id: purchase.id }, data: { status: 'CANCELLED' } }).catch(() => {});
        throw error;
    }
}

async function processarPagamentoWebhook(paymentId) {
    const remotePayment = await consultarPagamento(paymentId);
    const externalReference = remotePayment.external_reference;
    if (typeof externalReference !== 'string' || !externalReference.startsWith('redapro:')) {
        const error = new Error('Pagamento sem referência interna válida.');
        error.status = 400;
        throw error;
    }

    const purchaseId = externalReference.slice('redapro:'.length);
    const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId } });
    if (!purchase) {
        const error = new Error('Compra não encontrada.');
        error.status = 404;
        throw error;
    }

    const status = paymentStatus(remotePayment.status);
    const amountCents = Math.round(Number(remotePayment.transaction_amount) * 100);
    const currency = remotePayment.currency_id || 'BRL';
    if (amountCents !== purchase.amountCents || currency !== purchase.currency) {
        const error = new Error('Valor ou moeda do pagamento não conferem.');
        error.status = 400;
        throw error;
    }

    const payment = await prisma.$transaction(async (tx) => {
        const existing = await tx.payment.findUnique({ where: { mercadoPagoPaymentId: String(remotePayment.id) } });
        if (existing && (existing.purchaseId !== purchase.id || existing.userId !== purchase.userId)) {
            const error = new Error('Pagamento associado a outra compra.');
            error.status = 409;
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
        return saved;
    });

    if (status === 'APPROVED') {
        const alreadyGranted = await prisma.creditLot.findUnique({ where: { purchaseId: purchase.id } });
        if (!alreadyGranted) {
            try {
                await concederCreditos({ userId: purchase.userId, purchaseId: purchase.id, credits: purchase.credits });
            } catch (error) {
                if (error.code !== 'P2002') throw error;
            }
            console.info(`Pagamento ${payment.id} aprovado; ${purchase.credits} créditos concedidos.`);
        }
    }

    return payment;
}

module.exports = { criarCompra, processarPagamentoWebhook };
