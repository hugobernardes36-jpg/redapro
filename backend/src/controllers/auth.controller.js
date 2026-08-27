const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');
const { CSRF_COOKIE_NAME } = require('../middlewares/csrf.middleware');
const { SESSION_COOKIE_NAME } = require('../middlewares/auth.middleware');
const prisma = require('../lib/prisma');
const { sendPasswordResetEmail, sendEmailVerificationEmail } = require('../services/email.service');
const isProduction = process.env.NODE_ENV === 'production';

let JWT_SECRET = process.env.JWT_SECRET;
if (isProduction && (!JWT_SECRET || JWT_SECRET === 'dev-secret-change-me')) {
    throw new Error('JWT_SECRET não está definido nas variáveis de ambiente em produção.');
}
if (!JWT_SECRET) {
    JWT_SECRET = 'dev-secret-change-me';
}

const SESSION_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

const CSRF_COOKIE_OPTIONS = {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

function csrf(req, res) {
    const token = req.cookies?.[CSRF_COOKIE_NAME] || crypto.randomBytes(24).toString('hex');
    res.cookie(CSRF_COOKIE_NAME, token, CSRF_COOKIE_OPTIONS);
    return res.status(200).json({ token });
}

function emitirTokenSessao(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            tokenVersion: user.tokenVersion || 0,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

function setSessionCookie(res, token) {
    res.cookie(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
}

function validarSenha(password) {
    const senha = typeof password === 'string' ? password : '';
    if (senha.trim().length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
    if (senha.length > 128) return 'A senha não pode exceder 128 caracteres.';
    if (!/[0-9]/.test(senha)) return 'A senha deve conter pelo menos um número.';
    return null;
}

function hashResetToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function respostaRecuperacao(res) {
    return res.status(200).json({
        message: 'Se o e-mail estiver cadastrado, enviaremos instruções para recuperação.',
    });
}

async function criarTokenDeVerificacao(usuarioId) {
    const token = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
        where: { id: usuarioId },
        data: {
            emailVerificationTokenHash: hashResetToken(token),
            emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
    });
    return token;
}

async function registrar(req, res) {
    try {
        const { name, email, password } = req.body || {};

        if (!name || !email || !password) {
            return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });
        }

        const erroSenha = validarSenha(password);
        if (erroSenha) {
            return res.status(400).json({ erro: erroSenha });
        }

        const emailNormalizado = authService.normalizarEmail(email);
        const usuarioExistente = await authService.buscarUsuarioPorEmail(emailNormalizado);

        if (usuarioExistente) {
            return res.status(409).json({ erro: 'Não foi possível criar a conta. Verifique os dados fornecidos ou tente fazer login.' });
        }

        const senhaHash = await bcrypt.hash(password, 12);
        const usuario = await authService.criarUsuario({
            name: String(name).trim(),
            email: emailNormalizado,
            password: senhaHash,
        });

        try {
            const verificationToken = await criarTokenDeVerificacao(usuario.id);
            await sendEmailVerificationEmail({ email: usuario.email, token: verificationToken });
        } catch (error) {
            console.error('Falha ao enviar e-mail de verificação:', error.code || error.message);
        }

        const token = emitirTokenSessao(usuario);
        setSessionCookie(res, token);

        return res.status(201).json({
            message: 'Conta criada com sucesso.',
            usuario: authService.paraRespostaPublica(usuario),
        });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error.message);
        return res.status(500).json({ erro: 'Erro ao criar conta.' });
    }
}

async function solicitarRedefinicaoSenha(req, res) {
    const email = req.body?.email;
    if (typeof email !== 'string' || email.trim().length < 3 || email.length > 254) {
        return respostaRecuperacao(res);
    }

    const emailNormalizado = authService.normalizarEmail(email);
    const usuario = await authService.buscarUsuarioPorEmail(emailNormalizado);
    if (!usuario) return respostaRecuperacao(res);

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(token);
    await prisma.user.update({
        where: { id: usuario.id },
        data: {
            passwordResetTokenHash: tokenHash,
            passwordResetExpires: new Date(Date.now() + 30 * 60 * 1000),
        },
    });

    try {
        await sendPasswordResetEmail({ email: usuario.email, token });
    } catch (error) {
        await prisma.user.update({
            where: { id: usuario.id },
            data: { passwordResetTokenHash: null, passwordResetExpires: null },
        }).catch(() => {});
        console.error('Falha ao enviar e-mail de recuperação:', error.code || error.message);
    }

    return respostaRecuperacao(res);
}

async function redefinirSenha(req, res) {
    const token = req.body?.token;
    const password = req.body?.password;
    const erroSenha = validarSenha(password);
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token) || erroSenha) {
        return res.status(400).json({ erro: erroSenha || 'Token de recuperação inválido.' });
    }

    const tokenHash = hashResetToken(token);
    const senhaHash = await bcrypt.hash(password, 12);
    const atualizado = await prisma.user.updateMany({
        where: {
            passwordResetTokenHash: tokenHash,
            passwordResetExpires: { gt: new Date() },
        },
        data: {
            password: senhaHash,
            passwordResetTokenHash: null,
            passwordResetExpires: null,
            tokenVersion: { increment: 1 },
        },
    });

    if (atualizado.count !== 1) {
        return res.status(400).json({ erro: 'Token de recuperação inválido ou expirado.' });
    }

    return res.status(200).json({ message: 'Senha redefinida com sucesso. Faça login novamente.' });
}

async function verificarEmail(req, res) {
    const token = req.query?.token;
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token)) {
        return res.status(400).json({ erro: 'Token de verificação inválido ou expirado.' });
    }

    const atualizado = await prisma.user.updateMany({
        where: {
            emailVerificationTokenHash: hashResetToken(token),
            emailVerificationExpires: { gt: new Date() },
        },
        data: {
            emailVerified: true,
            emailVerificationTokenHash: null,
            emailVerificationExpires: null,
        },
    });

    if (atualizado.count !== 1) {
        return res.status(400).json({ erro: 'Token de verificação inválido ou expirado.' });
    }

    return res.status(200).json({ message: 'E-mail confirmado com sucesso.' });
}

async function reenviarVerificacao(req, res) {
    const usuario = await authService.buscarUsuarioPorId(req.user.id);
    if (!usuario || usuario.emailVerified) {
        return res.status(200).json({ message: 'Se necessário, enviaremos um novo link de verificação.' });
    }

    try {
        const token = await criarTokenDeVerificacao(usuario.id);
        await sendEmailVerificationEmail({ email: usuario.email, token });
    } catch (error) {
        console.error('Falha ao reenviar e-mail de verificação:', error.code || error.message);
    }

    return res.status(200).json({ message: 'Se necessário, enviaremos um novo link de verificação.' });
}

async function login(req, res) {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
        }

        const usuario = await authService.buscarUsuarioPorEmail(email);
        if (!usuario) {
            // Mitigação contra enumeração de usuários (timing attack)
            await bcrypt.compare('dummy', '$2a$12$K.mK/m5T.n8zNlJ9R.y0VOrF2v.FfO5.tT/w6Z/v4zP8.R5Z5zK');
            return res.status(401).json({ erro: 'Credenciais inválidas.' });
        }

        const senhaValida = await bcrypt.compare(String(password), usuario.password || '');
        if (!senhaValida) {
            return res.status(401).json({ erro: 'Credenciais inválidas.' });
        }

        const token = emitirTokenSessao(usuario);
        setSessionCookie(res, token);

        return res.status(200).json({
            usuario: authService.paraRespostaPublica(usuario),
            message: 'Login realizado com sucesso.',
        });
    } catch (error) {
        console.error('Erro ao autenticar usuário:', error.message);
        return res.status(500).json({ erro: 'Erro ao entrar na conta.' });
    }
}

async function logout(req, res) {
    try {
        const token = req.cookies?.[SESSION_COOKIE_NAME];
        if (token) {
            try {
                const payload = jwt.verify(token, JWT_SECRET);
                await prisma.user.update({
                    where: { id: Number(payload.sub) },
                    data: { tokenVersion: { increment: 1 } },
                });
            } catch {
                // token inválido: basta limpar o cookie
            }
        }

        res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
        return res.status(200).json({ ok: true, message: 'Logout realizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao encerrar sessão:', error.message);
        return res.status(500).json({ erro: 'Erro ao sair.' });
    }
}

async function me(req, res) {
    try {
        const user = await authService.buscarUsuarioPorId(req.user.id);
        if (!user) {
            return res.status(401).json({ erro: 'Não autenticado.' });
        }
        return res.status(200).json({ usuario: authService.paraRespostaPublica(user) });
    } catch (error) {
        console.error('Erro ao obter usuário autenticado:', error.message);
        return res.status(500).json({ erro: 'Erro ao obter usuário.' });
    }
}

module.exports = {
    csrf,
    me,
    login,
    logout,
    registrar,
    solicitarRedefinicaoSenha,
    redefinirSenha,
    verificarEmail,
    reenviarVerificacao,
};
