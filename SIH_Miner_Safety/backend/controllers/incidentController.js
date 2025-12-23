import Incident from '../models/Incident.js';

// @desc    Get all incidents
// @route   GET /api/incidents
// @access  Private
export const getIncidents = async (req, res) => {
    try {
        const incidents = await Incident.find()
            .populate('reportedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: incidents.length,
            data: incidents
        });
    } catch (error) {
        console.error('Error fetching incidents:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Create new incident
// @route   POST /api/incidents
// @access  Private
export const createIncident = async (req, res) => {
    try {
        req.body.reportedBy = req.user.id;

        const incident = await Incident.create(req.body);

        res.status(201).json({
            success: true,
            data: incident
        });
    } catch (error) {
        console.error('Error creating incident:', error);
        res.status(400).json({
            success: false,
            message: 'Invalid data',
            error: error.message
        });
    }
};
