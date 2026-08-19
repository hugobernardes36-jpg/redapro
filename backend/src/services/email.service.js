const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

let transporter = null;

function obterTransportador() {
    if (transporter) return transporter;

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        return null;
    }

    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    return transporter;
}

// Sem SMTP configurado, o link é apenas registrado no console (modo desenvolvimento).
async function enviarEmail({ to, subject, html, textoConsoleFallback }) {
    const smtp = obterTransportador();

    if (!smtp) {
        console.log(`[email:dev] Para: ${to} | Assunto: ${subject}\n${textoConsoleFallback}`);
        return;
    }

    await smtp.sendMail({
        from: process.env.SMTP_FROM || 'RedaPro <no-reply@redapro.local>',
        to,
        subject,
        html,
    });
}

async function enviarEmailVerificacao(user, token) {
    const link = `${FRONTEND_URL}/verificar-email?token=${encodeURIComponent(token)}`;
    await enviarEmail({
        to: user.email,
        subject: 'Confirme seu e-mail no RedaPro',
        html: `<p>Olá, ${user.name}!</p><p>Confirme seu e-mail clicando no link abaixo (válido por 24 horas):</p><p><a href="${link}">${link}</a></p>`,
        textoConsoleFallback: `Link de verificação de e-mail: ${link}`,
    });
}

async function enviarEmailRedefinicaoSenha(user, token) {
    const link = `${FRONTEND_URL}/redefinir-senha?token=${encodeURIComponent(token)}`;
    await enviarEmail({
        to: user.email,
        subject: 'Redefinição de senha - RedaPro',
        html: `<p>Olá, ${user.name}!</p><p>Clique no link abaixo para redefinir sua senha (válido por 1 hora). Se você não pediu isso, ignore este e-mail:</p><p><a href="${link}">${link}</a></p>`,
        textoConsoleFallback: `Link de redefinição de senha: ${link}`,
    });
}

module.exports = { enviarEmailVerificacao, enviarEmailRedefinicaoSenha };
