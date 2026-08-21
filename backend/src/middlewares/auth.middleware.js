const { getAuth, clerkClient } = require('@clerk/express');
const { sincronizarUsuarioClerk } = require('../services/auth.service');

async function requireAuth(req, res, next) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ erro: 'Não autenticado.' });
        }

        const clerkUser = await clerkClient.users.getUser(userId);
        const email = clerkUser.primaryEmailAddress?.emailAddress;
        if (!email) {
            return res.status(403).json({ erro: 'A conta não possui um e-mail válido.' });
        }

        const user = await sincronizarUsuarioClerk({
            clerkUserId: userId,
            email,
            name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || email.split('@')[0],
            emailVerified: clerkUser.primaryEmailAddress.verification?.status === 'verified',
        });

        req.user = { id: user.id, clerkUserId: user.clerkUserId, email: user.email, name: user.name };

        return next();
    } catch (error) {
        console.error('Erro no middleware de autenticação Clerk:', error.message);
        return res.status(error.statusCode === 401 ? 401 : 500).json({ erro: error.statusCode === 401 ? 'Sessão inválida ou expirada.' : 'Erro ao validar autenticação.' });
    }
}

module.exports = { requireAuth };
