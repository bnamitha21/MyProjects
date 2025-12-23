import express from 'express';
import { protect as auth } from '../middleware/authMiddleware.js';
import { io } from '../server.js';

const router = express.Router();

// Mock alerts data (in a real app, this would come from a database)
const alerts = [
  {
    id: '1',
    title: 'Safety Meeting',
    message: 'Mandatory safety meeting today at 2 PM in the main hall',
    severity: 'info',
    targetRoles: ['employee', 'supervisor', 'admin'],
    createdAt: '2023-11-01T10:00:00Z'
  },
  {
    id: '2',
    title: 'Maintenance Alert',
    message: 'Section C will be closed for maintenance on Nov 5th',
    severity: 'warning',
    targetRoles: ['employee', 'supervisor'],
    createdAt: '2023-11-02T14:30:00Z'
  }
];

// Get all alerts for the user's role
router.get('/', auth, (req, res) => {
  const userRole = req.user.role;
  const userAlerts = alerts.filter(alert => alert.targetRoles.includes(userRole));
  
  res.json({
    success: true,
    data: userAlerts
  });
});

// Create a new alert (admin/supervisor only)
router.post('/', auth, (req, res) => {
  // Check if user is admin or supervisor
  if (req.user.role !== 'admin' && req.user.role !== 'supervisor') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Supervisor only.'
    });
  }
  
  // In a real app, you would validate and save to database
  const newAlert = {
    id: (alerts.length + 1).toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  // Emit the alert to all targeted roles via Socket.IO
  if (newAlert.targetRoles && Array.isArray(newAlert.targetRoles)) {
    newAlert.targetRoles.forEach(role => {
      io.to(role).emit('new-alert', newAlert);
    });
  }
  
  // For demo purposes, just return success
  res.status(201).json({
    success: true,
    message: 'Alert created and sent successfully',
    data: newAlert
  });
});

// Mark alert as read for a user
router.patch('/:id/read', auth, (req, res) => {
  const alertId = req.params.id;
  const alert = alerts.find(a => a.id === alertId);
  
  if (!alert) {
    return res.status(404).json({
      success: false,
      message: 'Alert not found'
    });
  }
  
  // In a real app, you would update the database to mark as read for this user
  
  res.json({
    success: true,
    message: 'Alert marked as read',
    data: { alertId }
  });
});

export default router;