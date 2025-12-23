import express from 'express';
import { getIncidents, createIncident } from '../controllers/incidentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getIncidents);
router.post('/', protect, createIncident);

export default router;