import express from 'express';
import { getAllUsers, updateUserShift, updateUserOperationRole } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// List all employees and supervisors
router.get('/', protect, authorize('admin'), getAllUsers);

// Update shift location/date for a specific user
router.put('/:id/shift', protect, authorize('admin'), updateUserShift);

// Update employee operational role
router.put('/:id/role', protect, authorize('admin'), updateUserOperationRole);

export default router;
