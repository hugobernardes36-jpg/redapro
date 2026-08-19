const { verificarToken, buscarUsuarioPorId } = require('../services/auth.service');

const COOKIE_NAME = 'redapro_token';

async function requireAuth(req, res, next) {
    try {
        const token = req.cookies?.[COOKIE_NAME];

        if (!token) {
            return res.status(401).json({ erro: 'Não autenticado.' });
        }

        let payload;
        try {
            payload = verificarToken(token);
        } catch {
            return res.status(401).json({ erro: 'Sessão inválida ou expirada.' });
        }

        const user = await buscarUsuarioPorId(payload.sub);
        if (!user) {
            return res.status(401).json({ erro: 'Sessão inválida ou expirada.' });
        }

        // tokenVersion divergente = sessão revogada (logout real, troca de senha).
        if (Number(payload.tv) !== user.tokenVersion) {
            return res.status(401).json({ erro: 'Sessão inválida ou expirada.' });
        }

        // A identidade do usuário vem exclusivamente do token validado, nunca do corpo/query da requisição.
        req.user = { id: user.id, email: user.email, name: user.name };

        return next();
    } catch (error) {
        console.error('Erro no middleware de autenticação:', error.message);
        return res.status(500).json({ erro: 'Erro ao validar autenticação.' });
    }
}

module.exports = { requireAuth, COOKIE_NAME };
