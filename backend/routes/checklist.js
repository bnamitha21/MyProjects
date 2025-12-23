import express from 'express';
import { 
  getUserChecklist,
  completeChecklistItem,
  reportMissedChecklist,
  getMissedChecklistAlerts,
  acknowledgeMissedChecklistAlert,
  getIncompleteChecklists
} from '../controllers/checklistController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All checklist routes are protected
router.use(protect);

// Record a missed checklist event (employees trigger this)
router.post('/missed', reportMissedChecklist);

// Admin/supervisor views of missed checklist alerts
router.get('/missed/open', getMissedChecklistAlerts);
router.patch('/missed/:alertId/ack', acknowledgeMissedChecklistAlert);

// Get list of employees with incomplete daily checklists
router.get('/incomplete', authorize('admin', 'supervisor', 'dgms_officer'), getIncompleteChecklists);

// Get user's checklist for today
router.get('/:userId', getUserChecklist);

// Complete a checklist item
router.patch('/complete', completeChecklistItem);

export default router;