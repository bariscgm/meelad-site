import express from 'express';
import { restoreItem } from '../controllers/restoreController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:collectionName', protect, admin, restoreItem);

export default router;
