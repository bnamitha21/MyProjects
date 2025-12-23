import express from 'express';
import {
  triggerSOS,
  getSOSAlerts,
  acknowledgeSOSAlert,
  resolveSOSAlert,
} from '../controllers/sosController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Trigger SOS alert (employees and supervisors can trigger)
router.post('/trigger', triggerSOS);

// Get SOS alerts (admin only)
router.get('/alerts', getSOSAlerts);

// Acknowledge SOS alert (admin only)
router.patch('/alerts/:id/acknowledge', acknowledgeSOSAlert);

// Resolve SOS alert (admin only)
router.patch('/alerts/:id/resolve', resolveSOSAlert);

export default router;

