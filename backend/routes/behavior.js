import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  logEngagementEvent,
  getMyBehaviorSnapshot,
  getSupervisorBehaviorOverview,
  listBehaviorAlerts,
  acknowledgeBehaviorAlert,
  predictRisk,
} from '../controllers/behaviorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/events', protect, logEngagementEvent);
router.get('/snapshots/me', protect, getMyBehaviorSnapshot);
router.post('/predict', protect, predictRisk);

router.get(
  '/supervisor/overview',
  protect,
  authorize('supervisor', 'admin', 'dgms_officer'),
  getSupervisorBehaviorOverview
);

router.get(
  '/alerts',
  protect,
  authorize('supervisor', 'admin', 'dgms_officer'),
  listBehaviorAlerts
);

// Per-user limiter for sensitive actions (run after `protect` so req.user is available)
const perUserLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // allow 60 requests per user per window
  keyGenerator: (req /*, res*/) => {
    // Use authenticated user id when available, otherwise fall back to IP
    return req.user?._id?.toString() || req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/alerts/:id/acknowledge',
  protect,
  perUserLimiter,
  authorize('supervisor', 'admin', 'dgms_officer'),
  acknowledgeBehaviorAlert
);

export default router;

