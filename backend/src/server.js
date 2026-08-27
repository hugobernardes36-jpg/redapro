const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

function validarConfiguracaoDeProducao() {
  if (process.env.NODE_ENV !== 'production') return;

  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'OPENAI_API_KEY',
    'MERCADO_PAGO_ACCESS_TOKEN',
    'MERCADO_PAGO_WEBHOOK_SECRET',
    'RESEND_API_KEY',
    'EMAIL_FROM',
    'FRONTEND_URL',
    'APP_URL',
  ];
  const missing = required.filter((name) => !process.env[name]?.trim());
  const jwtSecret = process.env.JWT_SECRET || '';
  if (jwtSecret === 'dev-secret-change-me' || jwtSecret.length < 32) {
    missing.push('JWT_SECRET (forte, com pelo menos 32 caracteres)');
  }

  if (missing.length > 0) {
    throw new Error(`Configuração de produção incompleta: ${missing.join(', ')}`);
  }
}

validarConfiguracaoDeProducao();

const redacaoRoutes = require('./routes/redacao.routes');
const authRoutes = require('./routes/auth.routes');
const creditRoutes = require('./routes/credit.routes');
const paymentRoutes = require('./routes/payment.routes');
const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; base-uri 'self'; frame-ancestors 'self'; object-src 'none';"
  );
  next();
});

// Somente as origens explicitamente permitidas podem enviar cookies de sessão.
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origem não permitida pela política de CORS.'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '200kb' }));
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/redacoes', redacaoRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/payments', paymentRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "RedaPro API funcionando!"
  });
});

// Tratamento de erros: nunca vaza stack trace/detalhes internos para o cliente.
app.use((err, req, res, next) => {
  if (err && err.message === 'Origem não permitida pela política de CORS.') {
    return res.status(403).json({ erro: 'Origem não permitida.' });
  }
  console.error('Erro interno:', err.code || err.name || 'internal_error');
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`RedaPro API rodando em http://localhost:${PORT}`);
});