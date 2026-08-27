const { criarCompra, processarPagamentoWebhook } = require('../services/payment.service');
const { validarAssinaturaWebhook } = require('../services/mercadoPago.service');
const { getCreditPackage } = require('../config/creditPackages.config');
const prisma = require('../lib/prisma');

async function checkout(req, res) {
    try {
        const packageId = req.body?.packageId;
        if (typeof packageId !== 'string' || !getCreditPackage(packageId)) {
            return res.status(400).json({ erro: 'Pacote de créditos inválido.' });
        }

        return res.status(201).json(await criarCompra(req.user.id, packageId));
    } catch (error) {
        console.error('Erro ao criar checkout:', {
            name: error.name,
            code: error.code,
            status: error.status,
            message: error.message,
            cause: error.cause,
        });
        if (error.code === 'MP_CONFIG') {
            return res.status(503).json({ erro: 'Checkout indisponível: pagamento não configurado no servidor.' });
        }
        return res.status(error.status || 502).json({ erro: 'Não foi possível iniciar o checkout.' });
    }
}

async function webhook(req, res) {
    const dataId = req.body?.data?.id || req.query?.['data.id'];
    const signature = req.headers['x-signature'];
    const requestId = req.headers['x-request-id'];

    console.log('[WEBHOOK] Recebido:', { 
        hasSignature: !!signature, 
        hasRequestId: !!requestId,
        type: req.body?.type,
        nodeEnv: process.env.NODE_ENV
    });

    if (!validarAssinaturaWebhook({ signature, requestId, dataId })) {
        console.error('[WEBHOOK] Validação de assinatura falhou:', { 
            hasSecret: !!process.env.MERCADO_PAGO_WEBHOOK_SECRET,
            hasRequestId: !!requestId,
            hasDataId: !!dataId
        });
        return res.status(401).json({ erro: 'Webhook não autorizado.' });
    }

    if (req.body?.type !== 'payment' || !dataId) {
        return res.status(200).json({ ok: true });
    }

    const eventKey = `payment:${dataId}`;
    try {
        await prisma.webhookEvent.create({
            data: { eventKey, eventType: 'payment', mercadoPagoId: String(dataId) },
        });
    } catch (error) {
        if (error.code === 'P2002') {
            const existing = await prisma.webhookEvent.findUnique({ where: { eventKey } });
            if (!existing) {
                return res.status(200).json({ ok: true });
            }
            // Sempre permite reprocessamento - o status do pagamento pode ter mudado
                console.log(`[WEBHOOK] Evento já existe. Permitindo reprocessamento. Status anterior: ${existing.status}`);
            await prisma.webhookEvent.update({
                where: { eventKey },
                data: { status: 'RECEIVED', lastError: null, attempts: { increment: 0 } },
            });
        } else {
            console.error('Erro ao registrar webhook de pagamento:', error.message);
            return res.status(500).json({ erro: 'Webhook não processado.' });
        }
    }

    try {
        await processarPagamentoWebhook(dataId);
        await prisma.webhookEvent.update({
            where: { eventKey },
            data: { status: 'PROCESSED', processedAt: new Date(), attempts: { increment: 1 } },
        });
        console.info('[WEBHOOK] Pagamento processado com sucesso.');
        return res.status(200).json({ ok: true });
    } catch (error) {
        console.error('[WEBHOOK] Erro ao processar pagamento:', {
            message: error.message,
            code: error.code,
            status: error.status
        });
        await prisma.webhookEvent.update({
            where: { eventKey },
            data: { status: 'FAILED', lastError: error.message, attempts: { increment: 1 } },
        }).catch(() => {});
        return res.status(error.status && error.status < 500 ? error.status : 500).json({ erro: 'Webhook não processado.' });
    }
}

module.exports = { checkout, webhook };
