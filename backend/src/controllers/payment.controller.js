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

    if (!validarAssinaturaWebhook({ signature, requestId, dataId })) {
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
            if (!existing || existing.status === 'PROCESSED') {
                return res.status(200).json({ ok: true });
            }
            await prisma.webhookEvent.update({
                where: { eventKey },
                data: { status: 'RECEIVED', lastError: null },
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
        return res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Erro ao processar webhook de pagamento:', error.message);
        await prisma.webhookEvent.update({
            where: { eventKey },
            data: { status: 'FAILED', lastError: 'Falha ao confirmar pagamento.', attempts: { increment: 1 } },
        }).catch(() => {});
        return res.status(error.status && error.status < 500 ? error.status : 500).json({ erro: 'Webhook não processado.' });
    }
}

module.exports = { checkout, webhook };
