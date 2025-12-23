import express from 'express';
import { generateDgmsReport } from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// DGMS export: supports CSV (default) or PDF via ?format=pdf
router.get('/dgms', protect, authorize('admin', 'supervisor', 'dgms_officer'), generateDgmsReport);

export default router;
