const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const redacaoRoutes = require('./routes/redacao.routes');
const authRoutes = require('./routes/auth.routes');
const creditRoutes = require('./routes/credit.routes');
const paymentRoutes = require('./routes/payment.routes');
const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use((req, res, next) => {
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
  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`RedaPro API rodando em http://localhost:${PORT}`);
});