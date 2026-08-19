const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const {
    AI_RATE_LIMIT_WINDOW_MS,
    AI_RATE_LIMIT_MAX_REQUESTS,
    AI_RATE_LIMIT_MAX_REQUESTS_PER_IP,
} = require('../config/aiLimits.config');

// Limita tentativas de login/cadastro/OAuth para dificultar ataques de força bruta e enumeração.
const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { erro: 'Muitas tentativas. Tente novamente mais tarde.' },
});

// Limita, por usuário autenticado, requisições aos endpoints que geram custo com a OpenAI
// (criação e correção de redação), independentemente do IP de origem.
const aiRateLimiterPerUser = rateLimit({
    windowMs: AI_RATE_LIMIT_WINDOW_MS,
    limit: AI_RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => (req.user?.id ? `user:${req.user.id}` : ipKeyGenerator(req.ip)),
    message: { erro: 'Muitas requisições. Aguarde alguns instantes antes de tentar novamente.' },
});

// Camada adicional por IP, para dificultar abuso via múltiplas contas na mesma origem.
const aiRateLimiterPerIp = rateLimit({
    windowMs: AI_RATE_LIMIT_WINDOW_MS,
    limit: AI_RATE_LIMIT_MAX_REQUESTS_PER_IP,
    standardHeaders: true,
    legacyHeaders: false,
    message: { erro: 'Muitas requisições. Aguarde alguns instantes antes de tentar novamente.' },
});

module.exports = { authRateLimiter, aiRateLimiterPerUser, aiRateLimiterPerIp };
