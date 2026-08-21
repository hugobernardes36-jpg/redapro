const crypto = require('crypto');
const authService = require('../services/auth.service');
const { CSRF_COOKIE_NAME } = require('../middlewares/csrf.middleware');
const isProduction = process.env.NODE_ENV === 'production';

// O cookie CSRF precisa ser legível pelo JS do frontend para ser reenviado em um header.
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
};
