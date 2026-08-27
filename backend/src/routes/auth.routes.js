const express = require('express');
const router = express.Router();

const { csrf, me, login, logout, registrar, verificarEmail, reenviarVerificacao } = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { csrfProtection } = require('../middlewares/csrf.middleware');
const { authRateLimiter, passwordResetRateLimiter } = require('../middlewares/rateLimit.middleware');
const { solicitarRedefinicaoSenha, redefinirSenha } = require('../controllers/auth.controller');

router.get('/csrf', csrf);
router.get('/me', requireAuth, me);
router.post('/registrar', authRateLimiter, registrar);
router.post('/login', authRateLimiter, login);
router.post('/forgot-password', passwordResetRateLimiter, solicitarRedefinicaoSenha);
router.post('/reset-password', passwordResetRateLimiter, redefinirSenha);
router.get('/verify-email', passwordResetRateLimiter, verificarEmail);
router.post('/resend-verification', passwordResetRateLimiter, csrfProtection, reenviarVerificacao);
router.post('/logout', csrfProtection, logout);

module.exports = router;

