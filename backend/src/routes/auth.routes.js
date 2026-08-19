const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { csrfProtection } = require('../middlewares/csrf.middleware');
const { authRateLimiter } = require('../middlewares/rateLimit.middleware');

// Antes de existir sessão não há cookie CSRF para validar; login/cadastro/Google não precisam do check.
router.post('/registrar', authRateLimiter, registrar);
router.post('/login', authRateLimiter, login);
router.post('/google', authRateLimiter, loginGoogle);
router.post('/esqueci-senha', authRateLimiter, esqueciSenha);
router.post('/redefinir-senha', authRateLimiter, redefinirSenha);
router.post('/verificar-email', authRateLimiter, verificarEmail);

router.get('/csrf', csrf);

router.post('/logout', csrfProtection, logout);
router.get('/me', requireAuth, me);
router.post('/reenviar-verificacao', requireAuth, csrfProtection, authRateLimiter, reenviarVerificacao);

module.exports = router;

