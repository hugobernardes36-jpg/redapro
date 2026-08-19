const crypto = require('crypto');
const authService = require('../services/auth.service');
const { validarCadastro, validarLogin, validarEmailParaRedefinicao, validarNovaSenha } = require('../validators/auth.validator');
const { COOKIE_NAME } = require('../middlewares/auth.middleware');
const { CSRF_COOKIE_NAME } = require('../middlewares/csrf.middleware');

const isProduction = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
};

// O cookie CSRF precisa ser legível pelo JS do frontend para ser reenviado em um header.
const CSRF_COOKIE_OPTIONS = {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

function definirCookiesSessao(res, token) {
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    res.cookie(CSRF_COOKIE_NAME, crypto.randomBytes(24).toString('hex'), CSRF_COOKIE_OPTIONS);
}

function limparCookiesSessao(res) {
    res.clearCookie(COOKIE_NAME, { ...COOKIE_OPTIONS, maxAge: undefined });
    res.clearCookie(CSRF_COOKIE_NAME, { ...CSRF_COOKIE_OPTIONS, maxAge: undefined });
}

function csrf(req, res) {
    const token = req.cookies?.[CSRF_COOKIE_NAME] || crypto.randomBytes(24).toString('hex');
    res.cookie(CSRF_COOKIE_NAME, token, CSRF_COOKIE_OPTIONS);
    return res.status(200).json({ token });
}

async function registrar(req, res) {
    try {
        const validacao = validarCadastro(req.body || {});
        if (!validacao.valida) {
            return res.status(400).json({ erro: 'Dados inválidos.', detalhes: validacao.erros });
        }

        const user = await authService.cadastrar(validacao.dados);
        const token = authService.gerarToken(user);
        definirCookiesSessao(res, token);

        return res.status(201).json({ usuario: authService.paraRespostaPublica(user) });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ erro: error.message });
        }
        console.error('Erro ao registrar usuário:', error.message);
        return res.status(500).json({ erro: 'Erro ao criar conta.' });
    }
}

async function login(req, res) {
    try {
        const validacao = validarLogin(req.body || {});
        if (!validacao.valida) {
            return res.status(400).json({ erro: 'Dados inválidos.', detalhes: validacao.erros });
        }

        const user = await authService.autenticar(validacao.dados);
        const token = authService.gerarToken(user);
        definirCookiesSessao(res, token);

        return res.status(200).json({ usuario: authService.paraRespostaPublica(user) });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ erro: error.message });
        }
        console.error('Erro ao autenticar usuário:', error.message);
        return res.status(500).json({ erro: 'Erro ao entrar na conta.' });
    }
}

async function loginGoogle(req, res) {
    try {
        const { idToken } = req.body || {};
        const user = await authService.autenticarComGoogle(idToken);
        const token = authService.gerarToken(user);
        definirCookiesSessao(res, token);

        return res.status(200).json({ usuario: authService.paraRespostaPublica(user) });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ erro: error.message });
        }
        console.error('Erro ao autenticar com Google:', error.message);
        return res.status(500).json({ erro: 'Erro ao entrar com Google.' });
    }
}

async function logout(req, res) {
    try {
        const token = req.cookies?.[COOKIE_NAME];
        if (token) {
            try {
                const payload = authService.verificarToken(token);
                // Revoga a sessão de verdade no servidor (tokenVersion), não só limpa o cookie local.
                await authService.revogarSessoes(payload.sub);
            } catch {
                // Token já inválido/expirado: nada a revogar, apenas limpa os cookies.
            }
        }
    } finally {
        limparCookiesSessao(res);
    }

    return res.status(200).json({ ok: true });
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

async function verificarEmail(req, res) {
    try {
        const { token } = req.body || {};
        await authService.verificarEmail(token);
        return res.status(200).json({ ok: true });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ erro: error.message });
        }
        console.error('Erro ao verificar e-mail:', error.message);
        return res.status(500).json({ erro: 'Erro ao verificar e-mail.' });
    }
}

async function reenviarVerificacao(req, res) {
    try {
        await authService.reenviarVerificacao(req.user.id);
        return res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Erro ao reenviar verificação de e-mail:', error.message);
        return res.status(500).json({ erro: 'Erro ao reenviar verificação.' });
    }
}

async function esqueciSenha(req, res) {
    try {
        const validacao = validarEmailParaRedefinicao(req.body || {});
        if (!validacao.valida) {
            return res.status(400).json({ erro: 'Dados inválidos.', detalhes: validacao.erros });
        }

        await authService.solicitarRedefinicaoSenha(validacao.dados.email);

        // Resposta sempre genérica: não revela se o e-mail existe na base (evita enumeração).
        return res.status(200).json({ ok: true, mensagem: 'Se o e-mail existir, enviaremos instruções de redefinição.' });
    } catch (error) {
        console.error('Erro ao solicitar redefinição de senha:', error.message);
        return res.status(500).json({ erro: 'Erro ao processar solicitação.' });
    }
}

async function redefinirSenha(req, res) {
    try {
        const validacao = validarNovaSenha(req.body || {});
        if (!validacao.valida) {
            return res.status(400).json({ erro: 'Dados inválidos.', detalhes: validacao.erros });
        }

        await authService.redefinirSenha(validacao.dados.token, validacao.dados.password);
        return res.status(200).json({ ok: true });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ erro: error.message });
        }
        console.error('Erro ao redefinir senha:', error.message);
        return res.status(500).json({ erro: 'Erro ao redefinir senha.' });
    }
}

module.exports = {
    registrar,
    login,
    loginGoogle,
    csrf,
    logout,
    me,
    verificarEmail,
    reenviarVerificacao,
    esqueciSenha,
    redefinirSenha,
};
