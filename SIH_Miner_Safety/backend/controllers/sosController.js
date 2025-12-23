import SOSAlert from '../models/SOSAlert.js';
import User from '../models/User.js';
import { normalizeRole } from '../utils/roleUtils.js';

// Socket.IO instance will be set by server.js
let ioInstance = null;

export const setIOInstance = (io) => {
  ioInstance = io;
};

const getIO = () => {
  return ioInstance;
};

// Hazard type labels
const HAZARD_LABELS = {
  underground_fire: 'Underground Fire',
  gas_leakage: 'Gas Leakage',
  water_leak: 'Water Leak',
  rock_fall: 'Rock Fall',
  blasting_error: 'Blasting Error',
};

// @desc    Trigger SOS emergency alert
// @route   POST /api/sos/trigger
// @access  Private (Worker, Supervisor)
export const triggerSOS = async (req, res) => {
  try {
    const { hazardType, location } = req.body;
    const userId = req.user.id;

    // Validate hazard type
    if (!['underground_fire', 'gas_leakage', 'water_leak', 'rock_fall', 'blasting_error'].includes(hazardType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hazard type. Must be one of: underground_fire, gas_leakage, water_leak, rock_fall, blasting_error'
      });
    }

    // Get user details
    const user = await User.findById(userId).select('name email role');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const normalizedUserRole = normalizeRole(user.role);

    // Create SOS alert
    const sosAlert = await SOSAlert.create({
      triggeredBy: userId,
      hazardType,
      location: location || {
        type: 'Point',
        coordinates: [0, 0],
        description: 'Location not provided',
      },
      status: 'active',
      metadata: {
        triggeredAt: new Date(),
        employeeName: user.name,
        employeeEmail: user.email,
        employeeRole: normalizedUserRole,
      },
    });

    // Populate the alert with user details
    await sosAlert.populate('triggeredBy', 'name email role');

    // Prepare alert data packet
    const alertData = {
      id: sosAlert._id,
      hazardType: sosAlert.hazardType,
      hazardLabel: HAZARD_LABELS[sosAlert.hazardType],
      employeeId: user._id.toString(),
      employeeName: user.name,
      employeeEmail: user.email,
      location: sosAlert.location,
      timestamp: sosAlert.createdAt,
      status: sosAlert.status,
      urgency: 'CRITICAL',
    };

    // Emit real-time alert to admin and supervisor rooms via Socket.IO
    const io = getIO();
    if (io) {
      io.to('admin').emit('sos-emergency-alert', alertData);
      io.to('supervisor').emit('sos-emergency-alert', alertData);

      // Also emit to all connected clients for immediate visibility
      io.emit('sos-emergency-broadcast', {
        ...alertData,
        broadcast: true,
      });
    }

    console.log(`🚨 SOS ALERT TRIGGERED: ${HAZARD_LABELS[hazardType]} by ${user.name} (${user._id})`);

    res.status(201).json({
      success: true,
      message: 'SOS alert triggered successfully. Admin and supervisors have been notified.',
      data: alertData,
    });
  } catch (error) {
    console.error('Error triggering SOS alert:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while triggering SOS alert',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get SOS alerts (all or filtered by status)
// @route   GET /api/sos/alerts?status=active|acknowledged|resolved
// @access  Private (Admin only)
export const getSOSAlerts = async (req, res) => {
  try {
    const { status } = req.query;

    // Build query - only filter by status if explicitly provided
    const query = status && status !== 'all' ? { status } : {};

    const alerts = await SOSAlert.find(query)
      .populate('triggeredBy', 'name email role')
      .populate('acknowledgedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    const normalizedAlerts = alerts.map((alert) => {
      const safeAlert = alert.toObject();
      if (safeAlert.triggeredBy) {
        safeAlert.triggeredBy.role = normalizeRole(safeAlert.triggeredBy.role);
      }
      return safeAlert;
    });

    res.json({
      success: true,
      data: normalizedAlerts,
      count: normalizedAlerts.length,
    });
  } catch (error) {
    console.error('Error fetching SOS alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching SOS alerts',
    });
  }
};

// @desc    Acknowledge SOS alert
// @route   PATCH /api/sos/alerts/:id/acknowledge
// @access  Private (Admin only)
export const acknowledgeSOSAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const alert = await SOSAlert.findById(id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'SOS alert not found',
      });
    }

    if (alert.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Alert is already acknowledged or resolved',
      });
    }

    alert.status = 'acknowledged';
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date();
    await alert.save();

    await alert.populate('triggeredBy', 'name email');
    await alert.populate('acknowledgedBy', 'name email');

    // Notify via Socket.IO
    const io = getIO();
    if (io) {
      io.emit('sos-alert-acknowledged', {
        alertId: alert._id,
        acknowledgedBy: req.user.name,
        timestamp: alert.acknowledgedAt,
      });
    }

    res.json({
      success: true,
      message: 'SOS alert acknowledged',
      data: alert,
    });
  } catch (error) {
    console.error('Error acknowledging SOS alert:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while acknowledging SOS alert',
    });
  }
};

// @desc    Resolve SOS alert
// @route   PATCH /api/sos/alerts/:id/resolve
// @access  Private (Admin only)
export const resolveSOSAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const alert = await SOSAlert.findById(id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'SOS alert not found',
      });
    }

    alert.status = 'resolved';
    alert.resolvedAt = new Date();
    if (!alert.acknowledgedBy) {
      alert.acknowledgedBy = userId;
      alert.acknowledgedAt = new Date();
    }
    await alert.save();

    await alert.populate('triggeredBy', 'name email');
    await alert.populate('acknowledgedBy', 'name email');

    // Notify via Socket.IO
    const io = getIO();
    if (io) {
      io.emit('sos-alert-resolved', {
        alertId: alert._id,
        resolvedBy: req.user.name,
        timestamp: alert.resolvedAt,
      });
    }

    res.json({
      success: true,
      message: 'SOS alert resolved',
      data: alert,
    });
  } catch (error) {
    console.error('Error resolving SOS alert:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resolving SOS alert',
    });
  }
};

