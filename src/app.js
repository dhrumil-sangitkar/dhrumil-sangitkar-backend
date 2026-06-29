require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const { runMigrations } = require('./db/migrate');
const { seedDatabase }  = require('./db/seed');
const errorHandler      = require('./middleware/errorHandler');
const { startKeepAlive } = require('./utils/keepAlive');

const authRoutes     = require('./routes/auth');
const mediaRoutes    = require('./routes/media');
const servicesRoutes = require('./routes/services');
const bookingRoutes  = require('./routes/booking');
const chatRoutes     = require('./routes/chat');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Security & Logging ────────────────────────────────────────
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── CORS ──────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3001',
];

if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(',').forEach((u) => {
    const trimmed = u.trim();
    if (trimmed) allowedOrigins.push(trimmed);
  });
}

const VERCEL_PATTERN = /^https:\/\/dhrumil-sangitkar.*\.vercel\.app$/;

console.log('CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (VERCEL_PATTERN.test(origin)) return callback(null, true);
    console.warn(`CORS blocked: ${origin}`);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());

// ─── Body Parser ───────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check (used by keep-alive pinger too) ─────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.2.0' });
});

// ─── API Routes ────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/media',    mediaRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/booking',  bookingRoutes);
app.use('/api/chat',     chatRoutes);

// ─── 404 Handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ──────────────────────────────────────
app.use(errorHandler);

// ─── Startup ───────────────────────────────────────────────────
async function start() {
  try {
    await runMigrations();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Dhrumil Portfolio Backend running on port ${PORT}`);
      // Start keep-alive pinger AFTER server is up
      startKeepAlive();
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
