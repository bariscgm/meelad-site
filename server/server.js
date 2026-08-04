import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import nocache from 'nocache';
import cron from 'node-cron';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const httpServer = createServer(app);

// --- CORS Configuration ---
// In production, only allow requests from your Vercel frontend.
// In development, allow localhost.
const allowedOrigins = [
  process.env.CLIENT_URL,                // e.g. https://meelad-site.vercel.app
  'http://localhost:5173',                // Vite dev server
  'http://localhost:3000',                // Fallback dev
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));

// --- Socket.IO ---
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // Render free tier can be slow to start — increase timeouts
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Make io accessible to route handlers via req.app.get('io')
app.set('io', io);

// Import Routes
import controllerRoutes from './routes/controllerRoutes.js';
import authRoutes from './routes/authRoutes.js';
import programRoutes from './routes/programRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Middleware
app.use(nocache());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health Check (Render uses this to monitor your service) ---
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/controller', controllerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'Meelad Fest API is running...',
    version: '1.0.0',
    health: '/health',
  });
});

// --- Socket.IO Connection ---
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  // Client can join specific rooms for targeted updates
  socket.on('join:scoreboard', () => {
    socket.join('scoreboard');
    console.log(`${socket.id} joined scoreboard room`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// --- Keep Render Awake Cron Job ---
// Pings the /health endpoint every 14 minutes to prevent the Render free tier from sleeping
cron.schedule('*/14 * * * *', () => {
  const backendUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5000}`;
  fetch(`${backendUrl}/health`)
    .then(res => console.log(`⏰ Cron Job: Pinged ${backendUrl}/health - Status: ${res.status}`))
    .catch(err => console.error(`⏰ Cron Job Error: Failed to ping server:`, err.message));
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📡 CORS allowed origins: ${allowedOrigins.join(', ')}`);
});

// --- Graceful Shutdown (Render sends SIGTERM before stopping) ---
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  httpServer.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  // Force shutdown after 10s if connections don't close
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
