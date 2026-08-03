import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import nocache from 'nocache';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

import controllerRoutes from './routes/controllerRoutes.js';
import authRoutes from './routes/authRoutes.js';
import programRoutes from './routes/programRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Middleware
app.use(cors());
app.use(nocache());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Controller Routes
app.use('/api/controller', controllerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('Meelad Fest API is running...');
});

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  httpServer.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

export default app;
