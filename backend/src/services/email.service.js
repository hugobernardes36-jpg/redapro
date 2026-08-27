const { Resend } = require('resend');

function getEmailConfig() {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    const appUrl = process.env.APP_URL;

    if (!apiKey || !from || !appUrl) {
        const error = new Error('Serviço de e-mail não configurado.');
        error.code = 'EMAIL_CONFIG';
        throw error;
    }

    let parsedUrl;
    try {
        parsedUrl = new URL(appUrl);
    } catch {
        const error = new Error('APP_URL inválida.');
        error.code = 'EMAIL_CONFIG';
        throw error;
    }

    if (parsedUrl.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
        const error = new Error('APP_URL de produção precisa usar HTTPS.');
        error.code = 'EMAIL_CONFIG';
        throw error;
    }

    return { apiKey, from, appUrl: appUrl.replace(/\/$/, '') };
}

async function sendPasswordResetEmail({ email, token }) {
    const { apiKey, from, appUrl } = getEmailConfig();
    const resetUrl = `${appUrl}/redefinir-senha?token=${encodeURIComponent(token)}`;
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
        from,
        to: [email],
        subject: 'Redefinição de senha do RedaPro',
        text: `Recebemos uma solicitação para redefinir sua senha. Acesse este link em até 30 minutos: ${resetUrl}\n\nSe você não solicitou isso, ignore este e-mail.`,
        html: `<p>Recebemos uma solicitação para redefinir sua senha.</p><p><a href="${resetUrl}">Redefinir minha senha</a></p><p>Este link expira em 30 minutos. Se você não solicitou isso, ignore este e-mail.</p>`,
    });

    if (error) {
        console.error('Resend rejeitou o e-mail de recuperação:', {
            name: error.name,
            message: error.message,
            statusCode: error.statusCode,
            code: error.name || error.code,
        });
        const serviceError = new Error('Não foi possível enviar o e-mail.');
        serviceError.code = 'EMAIL_SEND_FAILED';
        throw serviceError;
    }
}

async function sendEmailVerificationEmail({ email, token }) {
    const { apiKey, from, appUrl } = getEmailConfig();
    const verificationUrl = `${appUrl}/verificar-email?token=${encodeURIComponent(token)}`;
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
        from,
        to: [email],
        subject: 'Confirme seu e-mail no RedaPro',
        text: `Confirme seu e-mail acessando este link em até 24 horas: ${verificationUrl}\n\nSe você não criou esta conta, ignore este e-mail.`,
        html: `<p>Confirme seu e-mail para ativar sua conta.</p><p><a href="${verificationUrl}">Confirmar meu e-mail</a></p><p>Este link expira em 24 horas. Se você não criou esta conta, ignore este e-mail.</p>`,
    });

    if (error) {
        console.error('Resend rejeitou o e-mail de verificação:', {
            name: error.name,
            message: error.message,
            statusCode: error.statusCode,
            code: error.name || error.code,
        });
        const serviceError = new Error('Não foi possível enviar o e-mail.');
        serviceError.code = 'EMAIL_SEND_FAILED';
        throw serviceError;
    }
}

module.exports = { sendPasswordResetEmail, sendEmailVerificationEmail };