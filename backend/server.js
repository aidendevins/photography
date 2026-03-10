const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDB } = require('./db');
const app = express();
const PORT = process.env.PORT || 8000;

const frontendUrls = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(u => u.trim()).filter(Boolean)
  : ['http://localhost:5173'];

const allowedOrigins = new Set();
frontendUrls.forEach(url => {
  allowedOrigins.add(url);
  try {
    const u = new URL(url);
    if (u.hostname.startsWith('www.')) {
      allowedOrigins.add(`${u.protocol}//${u.hostname.slice(4)}`);
    } else {
      allowedOrigins.add(`${u.protocol}//www.${u.hostname}`);
    }
  } catch (_) {}
});

console.log('✅ Allowed CORS origins:', [...allowedOrigins]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    console.warn(`⚠️ CORS blocked: ${origin}`);
    callback(null, false);
  },
  credentials: true,
}));

app.use(express.json());
app.use('/api', require('./routes/api'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, async () => {
  console.log(`🚀 Server on port ${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.FRONTEND_URL) console.warn('⚠️ FRONTEND_URL not set');
    if (!process.env.DATABASE_URL) console.warn('⚠️ DATABASE_URL not set');
  }
  if (process.env.DATABASE_URL) await initDB();
});

module.exports = app;
