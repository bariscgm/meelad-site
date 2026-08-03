import express from 'express';
import { getAdminDashboard } from '../controllers/dashboardController.js';

const router = express.Router();

router.route('/admin').get(getAdminDashboard);

export default router;
