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

function getNotificationUrl() {
    const value = process.env.BACKEND_PUBLIC_URL;
    if (!value) return undefined;

    try {
        const url = new URL(value);
        if (url.protocol === 'https:') {
            return `${url.toString().replace(/\/$/, '')}/api/payments/webhook`;
        }
    } catch {
        // Se a URL não for válida ou não for HTTPS (ex: localhost), omite no ambiente local
    }

    return undefined;
}

async function criarPreferencia({ purchaseId, packageData }) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const client = getClient();
    const preference = new Preference(client);
    const notificationUrl = getNotificationUrl();

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
            ...(notificationUrl ? { notification_url: notificationUrl } : {}),
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
    
    if (!secret) {
        console.warn(`[MP-WEBHOOK] MERCADO_PAGO_WEBHOOK_SECRET não está configurado!`);
        return false;
    }
    
    if (!signature || !requestId || !dataId) {
        console.warn(`[MP-WEBHOOK] Dados incompletos:`, { 
            hasSignature: !!signature, 
            hasRequestId: !!requestId, 
            hasDataId: !!dataId 
        });
        return false;
    }

    const parts = Object.fromEntries(signature.split(',').map((part) => {
        const [key, value] = part.trim().split('=');
        return [key, value];
    }));

    if (!parts.v1 || !parts.ts) {
        console.warn(`[MP-WEBHOOK] Assinatura mal formatada, faltam v1 ou ts`);
        return false;
    }

    const timestamp = Number(parts.ts);
    const now = Math.floor(Date.now() / 1000);
    if (!Number.isInteger(timestamp) || Math.abs(now - timestamp) > 5 * 60) {
        console.warn('[MP-WEBHOOK] Assinatura fora da janela de validade');
        return false;
    }

    const manifest = `id:${dataId};request-id:${requestId};ts:${parts.ts};`;
    const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
    const received = Buffer.from(parts.v1, 'utf8');
    const calculated = Buffer.from(expected, 'utf8');

    const isValid = received.length === calculated.length && crypto.timingSafeEqual(received, calculated);
    
    if (!isValid) {
        console.error('[MP-WEBHOOK] Assinatura inválida.');
    } else {
        console.log(`[MP-WEBHOOK] ✓ Assinatura validada com sucesso`);
    }
    
    return isValid;
}

module.exports = { criarPreferencia, consultarPagamento, validarAssinaturaWebhook };
