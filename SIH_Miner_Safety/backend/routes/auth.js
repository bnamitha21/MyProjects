import express from 'express';
import { registerUser, loginUser, getUserProfile, updateLanguagePreference } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.route('/profile')
  .get(protect, getUserProfile);

router.route('/me')
  .get(protect, getUserProfile);

router.put('/preferences/language', protect, updateLanguagePreference);

export default router;