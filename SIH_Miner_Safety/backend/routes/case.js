import express from 'express';
import {
  createCaseStudy,
  updateCaseStudy,
  listCaseStudies,
  getCaseStudy,
  approveCaseStudy,
  logCaseEngagement,
} from '../controllers/caseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, listCaseStudies)
  .post(
    protect,
    createCaseStudy,
  );

router
  .route('/:id')
  .get(protect, getCaseStudy)
  .patch(
    protect,
    updateCaseStudy,
  );

router.post(
  '/:id/approve',
  protect,
  approveCaseStudy,
);

router.post('/:id/engagement', protect, logCaseEngagement);

export default router;

