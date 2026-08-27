const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');

const SESSION_COOKIE_NAME = 'redapro_session';

const isProduction = process.env.NODE_ENV === 'production';
let JWT_SECRET = process.env.JWT_SECRET;
if (isProduction && (!JWT_SECRET || JWT_SECRET === 'dev-secret-change-me')) {
    throw new Error('JWT_SECRET não está definido nas variáveis de ambiente em produção.');
}
if (!JWT_SECRET) {
    JWT_SECRET = 'dev-secret-change-me';
}

async function requireAuth(req, res, next) {
    try {
        const token = req.cookies?.[SESSION_COOKIE_NAME];
        if (!token) {
            return res.status(401).json({ erro: 'Não autenticado.' });
        }

        const payload = jwt.verify(token, JWT_SECRET);
        const user = await authService.buscarUsuarioPorId(payload.sub);

        if (!user || user.tokenVersion !== payload.tokenVersion) {
            return res.status(401).json({ erro: 'Sessão inválida ou expirada.' });
        }

        req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            tokenVersion: user.tokenVersion,
        };

        return next();
    } catch (error) {
        console.error('Erro no middleware de autenticação custom:', error.message);
        return res.status(401).json({ erro: 'Sessão inválida ou expirada.' });
    }
}

module.exports = { requireAuth, SESSION_COOKIE_NAME, JWT_SECRET };
