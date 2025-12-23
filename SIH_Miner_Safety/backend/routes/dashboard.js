import express from 'express';
import { getAdminDashboardStats } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/admin', protect, getAdminDashboardStats);

export default router;
