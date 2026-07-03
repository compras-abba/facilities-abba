require('dotenv').config();
const express = require('express');
const cors = require('cors');

const solicitacoesRouter = require('./routes/solicitacoes');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5174' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRouter);
app.use('/api/solicitacoes', solicitacoesRouter);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404
app.use((_, res) => res.status(404).json({ error: 'Rota não encontrada' }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error('❌ Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`\n🏗️  Facilities Backend rodando em http://localhost:${PORT}`);
  console.log(`📋 API disponível em http://localhost:${PORT}/api`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health\n`);
});
