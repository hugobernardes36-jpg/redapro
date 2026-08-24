const express = require('express');
const router = express.Router();

const { csrf, me, login, logout, registrar } = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { authRateLimiter } = require('../middlewares/rateLimit.middleware');

router.get('/csrf', csrf);
router.get('/me', requireAuth, me);
router.post('/registrar', authRateLimiter, registrar);
router.post('/login', authRateLimiter, login);
router.post('/logout', logout);

module.exports = router;

