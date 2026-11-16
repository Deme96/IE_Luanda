require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rota raiz de boas-vindas / status da API
app.get('/', (req, res) => {
  res.json({
    message: 'API de Gestão Eclesiástica I.E.G.B. está online e ativa!',
    endpoints: {
      health: '/api/health',
      membros: '/api/membros'
    }
  });
});

// Rota de Health Check
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ status: 'ok', db_time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Placeholder para rotas das entidades
app.get('/api/membros', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM membros ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
