import express from 'express';
import { protect as auth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Mock video data (in a real app, this would come from a database)
const videos = [
  {
    id: '1',
    title: 'Mine Safety Basics',
    description: 'Learn the fundamental safety protocols for mining operations',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://via.placeholder.com/300x200',
    duration: '10:30',
    category: 'Safety Basics',
    tags: ['beginner', 'safety', 'protocols']
  },
  {
    id: '2',
    title: 'Equipment Handling',
    description: 'Proper techniques for handling mining equipment safely',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://via.placeholder.com/300x200',
    duration: '15:45',
    category: 'Equipment',
    tags: ['equipment', 'handling', 'safety']
  },
  {
    id: '3',
    title: 'Emergency Response',
    description: 'How to respond to emergencies in mining environments',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://via.placeholder.com/300x200',
    duration: '12:20',
    category: 'Emergency',
    tags: ['emergency', 'response', 'critical']
  }
];

// Get all videos
router.get('/', auth, (req, res) => {
  res.json({
    success: true,
    data: videos
  });
});

// Get video by ID
router.get('/:id', auth, (req, res) => {
  const video = videos.find(v => v.id === req.params.id);
  
  if (!video) {
    return res.status(404).json({
      success: false,
      message: 'Video not found'
    });
  }
  
  res.json({
    success: true,
    data: video
  });
});

// Get videos by category
router.get('/category/:category', auth, (req, res) => {
  const categoryVideos = videos.filter(
    v => v.category.toLowerCase() === req.params.category.toLowerCase()
  );
  
  res.json({
    success: true,
    data: categoryVideos
  });
});

// Admin only: Add a new video
router.post('/', auth, (req, res) => {
  // In a real app, you would validate and save to database
  const newVideo = {
    id: (videos.length + 1).toString(),
    ...req.body,
    createdAt: new Date()
  };
  
  // For demo purposes, just return success
  res.status(201).json({
    success: true,
    message: 'Video added successfully',
    data: newVideo
  });
});

export default router;