import Hazard from '../models/Hazard.js';

// Get all hazards
export const getHazards = async (req, res) => {
  try {
    const hazards = await Hazard.find()
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: hazards.length,
      data: hazards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get hazard by ID
export const getHazardById = async (req, res) => {
  try {
    const hazard = await Hazard.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('resolution.resolvedBy', 'name email');
    
    if (!hazard) {
      return res.status(404).json({
        success: false,
        message: 'Hazard not found'
      });
    }
    
    res.json({
      success: true,
      data: hazard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create new hazard
export const createHazard = async (req, res) => {
  try {
    const { title, description, location, severity, category } = req.body;
    
    // Handle file upload
    let imageUrl = null;
    if (req.file) {
      // Construct the full image URL
      const protocol = req.protocol;
      const host = req.get('host');
      imageUrl = `${protocol}://${host}/uploads/hazards/${req.file.filename}`;
    }
    
    // Process location - frontend sends location as a string
    // Store it in location.description for now
    const locationData = {
      type: 'Point',
      coordinates: [0, 0], // Default coordinates, can be enhanced later with GPS
      description: location || 'Location not specified'
    };
    
    const hazard = await Hazard.create({
      title,
      description,
      location: locationData,
      severity: severity || 'medium',
      category: category || 'physical',
      imageUrl,
      reportedBy: req.user.id
    });
    
    // Populate the reportedBy field
    await hazard.populate('reportedBy', 'name email');
    
    res.status(201).json({
      success: true,
      data: hazard
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid data',
      error: error.message
    });
  }
};

// Update hazard
export const updateHazard = async (req, res) => {
  try {
    let hazard = await Hazard.findById(req.params.id);
    
    if (!hazard) {
      return res.status(404).json({
        success: false,
        message: 'Hazard not found'
      });
    }
    
    hazard = await Hazard.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: hazard
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid data',
      error: error.message
    });
  }
};

// Resolve hazard
export const resolveHazard = async (req, res) => {
  try {
    const { comment, actionTaken } = req.body;
    
    let hazard = await Hazard.findById(req.params.id);
    
    if (!hazard) {
      return res.status(404).json({
        success: false,
        message: 'Hazard not found'
      });
    }
    
    hazard = await Hazard.findByIdAndUpdate(
      req.params.id,
      {
        status: 'resolved',
        resolution: {
          comment,
          actionTaken,
          resolvedAt: Date.now(),
          resolvedBy: req.user.id
        }
      },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: hazard
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid data',
      error: error.message
    });
  }
};

// Delete hazard
export const deleteHazard = async (req, res) => {
  try {
    const hazard = await Hazard.findById(req.params.id);
    
    if (!hazard) {
      return res.status(404).json({
        success: false,
        message: 'Hazard not found'
      });
    }
    
    await Hazard.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get hazards by severity
export const getHazardsBySeverity = async (req, res) => {
  try {
    const hazards = await Hazard.find({ severity: req.params.severity })
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: hazards.length,
      data: hazards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get hazards by category
export const getHazardsByCategory = async (req, res) => {
  try {
    const hazards = await Hazard.find({ category: req.params.category })
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: hazards.length,
      data: hazards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};