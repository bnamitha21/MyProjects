import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect as auth } from '../middleware/authMiddleware.js';
import { 
  getHazards, 
  getHazardById, 
  createHazard, 
  updateHazard, 
  resolveHazard, 
  deleteHazard,
  getHazardsBySeverity,
  getHazardsByCategory
} from '../controllers/hazardController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/hazards'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'hazard-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

const router = express.Router();

// Get all hazards
router.get('/', auth, getHazards);

// Get hazards by severity
router.get('/severity/:severity', auth, getHazardsBySeverity);

// Get hazards by category
router.get('/category/:category', auth, getHazardsByCategory);

// Create new hazard (with file upload support)
router.post('/', auth, upload.single('image'), createHazard);

// Get hazard by ID
router.get('/:id', auth, getHazardById);

// Update hazard
router.put('/:id', auth, updateHazard);

// Resolve hazard
router.put('/:id/resolve', auth, resolveHazard);

// Delete hazard
router.delete('/:id', auth, deleteHazard);

export default router;