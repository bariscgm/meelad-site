/**
 * api.js - Express API Routes for Meelad Fest MVC architecture
 */

import express from 'express';

const router = express.Router();

// Health Check API
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Meelad Fest MVC API is operational', timestamp: new Date().toISOString() });
});

// Programs List API
router.get('/programs', (req, res) => {
  res.json({ success: true, message: 'Fetch programs endpoint' });
});

// Mark Publishing Endpoint API
router.post('/programs/:id/publish', (req, res) => {
  const { id } = req.params;
  const { published } = req.body;
  res.json({ success: true, message: `Program ${id} publish status set to ${published}` });
});

export default router;
