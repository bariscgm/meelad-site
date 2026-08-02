/**
 * server.js - Express MVC Server Backend for Meelad Fest
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import apiRoutes from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend views from /public
app.use(express.static(path.join(__dirname, '../public')));

// API Endpoint Routes
app.use('/api', apiRoutes);

// Fallback to SPA index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Meelad Fest MVC Server running on port ${PORT}`);
  console.log(`🌐 Web App URL: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
