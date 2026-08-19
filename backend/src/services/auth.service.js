const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const prisma = require('../lib/prisma');
const { normalizarEmail } = require('../validators/auth.validator');
const { enviarEmailVerificacao, enviarEmailRedefinicaoSenha } = require('./email.service');

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado. Defina essa variável de ambiente antes de iniciar o servidor.');
}

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

// Nunca inclui password/hash/tokens internos na resposta pública do usuário.
function paraRespostaPublica(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
    };
}

function gerarToken(user) {
    // tokenVersion permite revogar todas as sessões existentes (logout real, troca de senha).
    return jwt.sign({ sub: user.id, tv: user.tokenVersion }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verificarToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

function gerarTokenAleatorio() {
    return crypto.randomBytes(32).toString('hex');
}

async function buscarUsuarioPorEmail(email) {
    return prisma.user.findUnique({ where: { email: normalizarEmail(email) } });
}

async function buscarUsuarioPorId(id) {
    return prisma.user.findUnique({ where: { id: Number(id) } });
}

async function cadastrar({ name, email, password }) {
    const emailNormalizado = normalizarEmail(email);

    const existente = await buscarUsuarioPorEmail(emailNormalizado);
    if (existente) {
        const erro = new Error('Não foi possível concluir o cadastro com os dados informados.');
        erro.status = 409;
        throw erro;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const emailVerificationToken = gerarTokenAleatorio();

    const user = await prisma.user.create({
        data: {
            name,
            email: emailNormalizado,
            password: passwordHash,
            emailVerificationToken,
            emailVerificationExpires: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
        },
    });

    try {
        await enviarEmailVerificacao(user, emailVerificationToken);
    } catch (error) {
        console.error('Erro ao enviar e-mail de verificação:', error.message);
    }

    return user;
}

async function autenticar({ email, password }) {
    const erroGenerico = () => {
        const erro = new Error('E-mail ou senha inválidos.');
        erro.status = 401;
        return erro;
    };

    const user = await buscarUsuarioPorEmail(email);
    if (!user || !user.password) {
        throw erroGenerico();
    }

    const senhaConfere = await bcrypt.compare(password, user.password);
    if (!senhaConfere) {
        throw erroGenerico();
    }

    return user;
}

async function autenticarComGoogle(idToken) {
    if (!googleClient) {
        const erro = new Error('Login com Google não está configurado no servidor.');
        erro.status = 503;
        throw erro;
    }

    if (!idToken || typeof idToken !== 'string') {
        const erro = new Error('Token do Google não informado.');
        erro.status = 400;
        throw erro;
    }

    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
    } catch {
        const erro = new Error('Não foi possível validar sua identidade do Google.');
        erro.status = 401;
        throw erro;
    }

    if (!payload || !payload.sub || !payload.email) {
        const erro = new Error('Não foi possível validar sua identidade do Google.');
        erro.status = 401;
        throw erro;
    }

    if (payload.email_verified === false) {
        const erro = new Error('O e-mail da conta Google não está verificado.');
        erro.status = 401;
        throw erro;
    }

    const email = normalizarEmail(payload.email);
    const googleId = String(payload.sub);
    const name = payload.name || email.split('@')[0];

    let user = await prisma.user.findUnique({ where: { googleId } });

    if (!user) {
        // Vincula a uma conta já existente com o mesmo e-mail (ex.: criada via cadastro por senha).
        user = await buscarUsuarioPorEmail(email);

        if (user) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId, emailVerified: true },
            });
        } else {
            // O Google já validou a posse do e-mail, então a conta nasce verificada.
            user = await prisma.user.create({
                data: { name, email, googleId, emailVerified: true },
            });
        }
    }

    return user;
}

// Invalida todas as sessões existentes do usuário (logout real, não apenas limpeza do cookie local).
async function revogarSessoes(userId) {
    return prisma.user.update({
        where: { id: Number(userId) },
        data: { tokenVersion: { increment: 1 } },
    });
}

async function verificarEmail(token) {
    if (!token || typeof token !== 'string') {
        const erro = new Error('Token de verificação inválido.');
        erro.status = 400;
        throw erro;
    }

    const user = await prisma.user.findUnique({ where: { emailVerificationToken: token } });

    if (!user || !user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
        const erro = new Error('Link de verificação inválido ou expirado.');
        erro.status = 400;
        throw erro;
    }

    return prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: true,
            emailVerificationToken: null,
            emailVerificationExpires: null,
        },
    });
}

async function reenviarVerificacao(userId) {
    const user = await buscarUsuarioPorId(userId);

    if (!user || user.emailVerified) {
        return;
    }

    const emailVerificationToken = gerarTokenAleatorio();
    const atualizado = await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerificationToken,
            emailVerificationExpires: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
        },
    });

    await enviarEmailVerificacao(atualizado, emailVerificationToken);
}

// Sempre retorna sucesso genérico ao chamador, exista ou não o e-mail (evita enumeração de contas).
async function solicitarRedefinicaoSenha(email) {
    const user = await buscarUsuarioPorEmail(email);

    if (!user || !user.password) {
        return;
    }

    const passwordResetToken = gerarTokenAleatorio();
    const atualizado = await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordResetToken,
            passwordResetExpires: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
        },
    });

    try {
        await enviarEmailRedefinicaoSenha(atualizado, passwordResetToken);
    } catch (error) {
        console.error('Erro ao enviar e-mail de redefinição de senha:', error.message);
    }
}

async function redefinirSenha(token, novaSenha) {
    if (!token || typeof token !== 'string') {
        const erro = new Error('Token de redefinição inválido.');
        erro.status = 400;
        throw erro;
    }

    const user = await prisma.user.findUnique({ where: { passwordResetToken: token } });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
        const erro = new Error('Link de redefinição inválido ou expirado.');
        erro.status = 400;
        throw erro;
    }

    const passwordHash = await bcrypt.hash(novaSenha, SALT_ROUNDS);

    return prisma.user.update({
        where: { id: user.id },
        data: {
            password: passwordHash,
            passwordResetToken: null,
            passwordResetExpires: null,
            // Troca de senha invalida qualquer sessão que possa ter sido comprometida.
            tokenVersion: { increment: 1 },
        },
    });
}

module.exports = {
    gerarToken,
    verificarToken,
    cadastrar,
    autenticar,
    autenticarComGoogle,
    buscarUsuarioPorId,
    paraRespostaPublica,
    revogarSessoes,
    verificarEmail,
    reenviarVerificacao,
    solicitarRedefinicaoSenha,
    redefinirSenha,
};
