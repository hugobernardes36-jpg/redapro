const crypto = require('crypto');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

function configError(message) {
    const error = new Error(message);
    error.status = 503;
    error.code = 'MP_CONFIG';
    return error;
}

function getAccessToken() {
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!token) {
        throw configError('Access Token do Mercado Pago não configurado.');
    }
    return token;
}

function getClient() {
    return new MercadoPagoConfig({ accessToken: getAccessToken() });
}

function getBackendPublicUrl() {
    const value = process.env.BACKEND_PUBLIC_URL;
    if (!value) throw configError('BACKEND_PUBLIC_URL não está configurada para o webhook de teste.');

    let url;
    try {
        url = new URL(value);
    } catch {
        throw configError('BACKEND_PUBLIC_URL não é uma URL válida.');
    }

    if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
        throw configError('BACKEND_PUBLIC_URL deve usar HTTPS no ambiente de teste.');
    }

    return url.toString().replace(/\/$/, '');
}

async function criarPreferencia({ purchaseId, packageData }) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const client = getClient();
    const preference = new Preference(client);

    return preference.create({
        body: {
            items: [{
                id: packageData.id,
                title: `RedaPro - ${packageData.label}`,
                quantity: 1,
                currency_id: 'BRL',
                unit_price: packageData.amountCents / 100,
            }],
            external_reference: `redapro:${purchaseId}`,
            notification_url: `${getBackendPublicUrl()}/api/payments/webhook`,
            back_urls: {
                success: `${frontendUrl}/inicio?payment=success`,
                pending: `${frontendUrl}/inicio?payment=pending`,
                failure: `${frontendUrl}/inicio?payment=failure`,
            },
            ...(frontendUrl.startsWith('https://') ? { auto_return: 'approved' } : {}),
        },
    });
}

async function consultarPagamento(paymentId) {
    const payment = new Payment(getClient());
    return payment.get({ id: String(paymentId) });
}

function validarAssinaturaWebhook({ signature, requestId, dataId }) {
    const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
    if (!secret || !signature || !requestId || !dataId) return false;

    const parts = Object.fromEntries(signature.split(',').map((part) => {
        const [key, value] = part.trim().split('=');
        return [key, value];
    }));

    if (!parts.v1 || !parts.ts) return false;

    const manifest = `id:${dataId};request-id:${requestId};ts:${parts.ts};`;
    const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
    const received = Buffer.from(parts.v1, 'utf8');
    const calculated = Buffer.from(expected, 'utf8');

    return received.length === calculated.length && crypto.timingSafeEqual(received, calculated);
}

module.exports = { criarPreferencia, consultarPagamento, validarAssinaturaWebhook };
