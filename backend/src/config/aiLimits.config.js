// Configuração centralizada dos limites de uso da IA, controlados via variáveis de ambiente.

const AI_RATE_LIMIT_WINDOW_MS = Number(process.env.AI_RATE_LIMIT_WINDOW_MS) || 60 * 1000;
const AI_RATE_LIMIT_MAX_REQUESTS = Number(process.env.AI_RATE_LIMIT_MAX_REQUESTS) || 10;
const AI_RATE_LIMIT_MAX_REQUESTS_PER_IP = Number(process.env.AI_RATE_LIMIT_MAX_REQUESTS_PER_IP) || 30;
const DAILY_AI_CORRECTION_LIMIT = Number(process.env.DAILY_AI_CORRECTION_LIMIT) || 20;

module.exports = {
    AI_RATE_LIMIT_WINDOW_MS,
    AI_RATE_LIMIT_MAX_REQUESTS,
    AI_RATE_LIMIT_MAX_REQUESTS_PER_IP,
    DAILY_AI_CORRECTION_LIMIT,
};
