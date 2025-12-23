import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import authRoutes from './routes/auth.js';
import checklistRoutes from './routes/checklist.js';
import videoRoutes from './routes/video.js';
import hazardRoutes from './routes/hazard.js';
import incidentRoutes from './routes/incident.js';
import alertRoutes from './routes/alert.js';
import behaviorRoutes from './routes/behavior.js';
import healthRoutes from './routes/health.js';
import caseRoutes from './routes/case.js';
import mineRoutes from './routes/mine.js';
import userRoutes from './routes/users.js';
import sosRoutes from './routes/sos.js';
import dashboardRoutes from './routes/dashboard.js';
import reportsRoutes from './routes/reports.js';
import validateEnv from './config/validateEnv.js';
import { setIOInstance } from './controllers/sosController.js';

// Load environment variables
dotenv.config();
validateEnv();

// Initialize Express app
const app = express();
// Force backend to run on port 5000 by default (can still be overridden by PORT env)
const PORT = process.env.PORT || 5000;

// Create HTTP server and Socket.IO instance
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Set up SOS controller with io instance (must be done immediately after io is created)
setIOInstance(io);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiLimiter);

// Serve static files for uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mine-safety-app')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Handle real-time alerts
  socket.on('join-role-room', (role) => {
    socket.join(role);
    console.log(`User ${socket.id} joined room: ${role}`);
  });

  // Handle SOS emergency alerts
  socket.on('sos-emergency', (data) => {
    console.log('SOS emergency received:', data);
    // This is handled by the API endpoint, but we can also listen here for direct socket triggers
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/hazards', hazardRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/behavior', behaviorRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/mine', mineRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Mine Safety Companion API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`   API: http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ ERROR: Port ${PORT} is already in use!\n`);
    console.error(`To fix this, run: npm run kill:port ${PORT}`);
    console.error(`Or change the PORT in your .env file\n`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});

export { io };