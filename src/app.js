require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const { runMigrations } = require('./db/migrate');
const { seedDatabase }  = require('./db/seed');
const errorHandler      = require('./middleware/errorHandler');

const authRoutes     = require('./routes/auth');
const mediaRoutes    = require('./routes/media');
const servicesRoutes = require('./routes/services');
const bookingRoutes  = require('./routes/booking');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Security & Logging ────────────────────────────────────────
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── CORS ──────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',   // Vite dev
  'http://localhost:4173',   // Vite preview
  process.env.FRONTEND_URL,  // Production frontend URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ─── Body Parser ───────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));   // Allow base64 image uploads
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ──────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ─── API Routes ────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/media',    mediaRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/booking',  bookingRoutes);

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
      console.log(`🚀 Dhrumil Portfolio Backend running on http://localhost:${PORT}`);
      console.log(`📋 API docs summary:`);
      console.log(`   POST   /api/auth/verify-pin`);
      console.log(`   GET    /api/media`);
      console.log(`   POST   /api/media          [Admin]`);
      console.log(`   PUT    /api/media/:id       [Admin]`);
      console.log(`   DELETE /api/media/:id       [Admin]`);
      console.log(`   GET    /api/services`);
      console.log(`   POST   /api/services        [Admin]`);
      console.log(`   PUT    /api/services/:id    [Admin]`);
      console.log(`   DELETE /api/services/:id    [Admin]`);
      console.log(`   POST   /api/booking`);
      console.log(`   GET    /api/booking         [Admin]`);
      console.log(`   PATCH  /api/booking/:id/status [Admin]`);
      console.log(`   GET    /health`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
