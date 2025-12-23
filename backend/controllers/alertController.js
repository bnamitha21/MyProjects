import User from '../models/User.js';

// @desc    Create a new emergency alert
// @route   POST /api/alerts/emergency
// @access  Private
export const createEmergencyAlert = async (req, res) => {
  try {
    const { userId, location, gasLevels, message } = req.body;
    
    // In a real implementation, this would:
    // 1. Save the alert to the database
    // 2. Send push notifications to all relevant personnel
    // 3. Trigger emergency protocols
    
    // Find all users who should receive the alert (all users in this demo)
    const users = await User.find({}).select('_id name role');
    
    // Log the alert (in a real app, this would be saved to a database)
    console.log(`EMERGENCY ALERT: Location: ${location}, Triggered by: ${userId}`);
    console.log(`Alert recipients: ${users.length} users`);
    
    // Return success response
    res.status(201).json({ 
      success: true,
      message: 'Emergency alert sent successfully',
      recipients: users.length,
      timestamp: new Date()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get recent alerts for a user
// @route   GET /api/alerts/recent/:userId
// @access  Private
export const getRecentAlerts = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // In a real implementation, this would fetch alerts from the database
    // For demo purposes, we'll return mock data
    const mockAlerts = [
      {
        id: '1',
        type: 'gas',
        message: 'High methane levels detected in Section B',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        severity: 'high'
      },
      {
        id: '2',
        type: 'emergency',
        message: 'Emergency evacuation initiated by Supervisor',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        severity: 'high'
      },
      {
        id: '3',
        type: 'gas',
        message: 'Carbon monoxide levels above threshold in Section C',
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
        severity: 'medium'
      }
    ];
    
    res.json(mockAlerts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};