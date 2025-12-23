import Checklist from '../models/Checklist.js';
import User from '../models/User.js';
import BehaviorAlert from '../models/BehaviorAlert.js';
import { isEmployeeRole, normalizeRole } from '../utils/roleUtils.js';

// Expanded role-based safety checklist templates
const checklistTemplates = {
  employee: [
    { task: 'Put on hard hat, safety boots, and high-visibility vest', category: 'PPE', type: 'routine', pointsAwarded: 5, isChallenge: false },
    { task: 'Wear safety glasses and gloves appropriate for task', category: 'PPE', type: 'routine', pointsAwarded: 5, isChallenge: false },
    { task: 'Check personal gas detector is functioning', category: 'Equipment', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Inspect tools and equipment for damage or defects', category: 'Equipment', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Verify communication device (radio/phone) is working', category: 'Communication', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Confirm ventilation system is operating in work area', category: 'Environment', type: 'routine', pointsAwarded: 15, isChallenge: false },
    { task: 'Inspect immediate work area for hazards', category: 'Environment', type: 'routine', pointsAwarded: 15, isChallenge: false },
    { task: 'Verify emergency exit routes are clear', category: 'Safety', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Review assigned tasks and safety procedures', category: 'Procedures', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Report any unsafe conditions to supervisor', category: 'Reporting', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { 
      task: 'Safety Challenge: Identify 3 potential fall hazards in your current work zone.', 
      category: 'Safety Challenge', 
      type: 'challenge', 
      pointsAwarded: 50, 
      isChallenge: true, 
      associatedContent: { type: 'video', url: 'https://www.youtube.com/watch?v=your_fall_hazard_video_id' } 
    },
    { 
      task: 'Incident Review: Briefly summarize a recent incident from the library and identify one preventative measure.', 
      category: 'Incident Learning', 
      type: 'review', 
      pointsAwarded: 75, 
      isChallenge: true, 
      associatedContent: { type: 'caseStudy', id: 'your_case_study_id_here' } 
    },
    { task: 'Team Safety Huddle: Discuss a safety topic with a colleague and submit a brief note.', category: 'Communication', type: 'challenge', pointsAwarded: 40, isChallenge: true },
  ],
  supervisor: [
    { task: 'Conduct pre-shift safety briefing with team', category: 'Team Management', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Verify all employees are wearing proper PPE', category: 'PPE Compliance', type: 'routine', pointsAwarded: 15, isChallenge: false },
    { task: 'Review hazard reports from previous shift', category: 'Documentation', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Inspect critical safety equipment (alarms, lights, signs)', category: 'Equipment', type: 'routine', pointsAwarded: 25, isChallenge: false },
    { task: 'Check emergency evacuation routes and assembly points', category: 'Emergency Preparedness', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Verify ventilation and gas monitoring systems', category: 'Environment', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Inspect first aid kits and emergency supplies', category: 'Emergency Equipment', type: 'routine', pointsAwarded: 15, isChallenge: false },
    { task: 'Review work permits for high-risk activities', category: 'Permits', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Conduct spot checks on employee safety practices', category: 'Safety Audits', type: 'routine', pointsAwarded: 30, isChallenge: false },
    { task: 'Document any safety concerns or near-misses', category: 'Reporting', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Ensure adequate communication between all team members', category: 'Communication', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Verify emergency response team availability', category: 'Emergency Preparedness', type: 'routine', pointsAwarded: 15, isChallenge: false },
    { 
      task: 'Supervisor Challenge: Lead a discussion on a new safety procedure and collect team feedback.', 
      category: 'Team Leadership', 
      type: 'challenge', 
      pointsAwarded: 100, 
      isChallenge: true, 
      associatedContent: { type: 'document', url: 'https://www.example.com/new_safety_procedure.pdf' } 
    },
  ],
  admin: [
    { task: 'Review daily safety compliance reports', category: 'Compliance', type: 'routine', pointsAwarded: 30, isChallenge: false },
    { task: 'Check emergency response system status and alerts', category: 'Systems', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Verify safety training records are up to date', category: 'Training', type: 'routine', pointsAwarded: 25, isChallenge: false },
    { task: 'Review incident and near-miss reports', category: 'Incidents', type: 'routine', pointsAwarded: 30, isChallenge: false },
    { task: 'Update safety documentation and procedures as needed', category: 'Documentation', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Monitor equipment maintenance schedules', category: 'Maintenance', type: 'routine', pointsAwarded: 15, isChallenge: false },
    { task: 'Check safety equipment inventory levels', category: 'Inventory', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Review and approve safety improvement suggestions', category: 'Improvements', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Ensure communication systems are operational', category: 'Systems', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Coordinate with DGMS officers on regulatory matters', category: 'Coordination', type: 'routine', pointsAwarded: 25, isChallenge: false },
    { 
      task: 'Admin Challenge: Conduct a drill simulating a major incident and evaluate response protocols.', 
      category: 'Emergency Preparedness', 
      type: 'challenge', 
      pointsAwarded: 150, 
      isChallenge: true 
    },
  ],
  dgms_officer: [
    { task: 'Review overall regulatory compliance status', category: 'Compliance', type: 'routine', pointsAwarded: 40, isChallenge: false },
    { task: 'Check incident investigation reports and corrective actions', category: 'Investigations', type: 'routine', pointsAwarded: 35, isChallenge: false },
    { task: 'Verify safety audit schedule and completion status', category: 'Audits', type: 'routine', pointsAwarded: 30, isChallenge: false },
    { task: 'Review ventilation survey and gas monitoring data', category: 'Environment', type: 'routine', pointsAwarded: 25, isChallenge: false },
    { task: 'Check ground control and roof support management', category: 'Geotechnical', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Inspect mine plans and working drawings', category: 'Documentation', type: 'routine', pointsAwarded: 15, isChallenge: false },
    { task: 'Review electrical safety inspections and certifications', category: 'Electrical', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Verify explosive storage and handling compliance', category: 'Explosives', type: 'routine', pointsAwarded: 25, isChallenge: false },
    { task: 'Check statutory registers and records', category: 'Records', type: 'routine', pointsAwarded: 10, isChallenge: false },
    { task: 'Review emergency preparedness and rescue arrangements', category: 'Emergency', type: 'routine', pointsAwarded: 30, isChallenge: false },
    { task: 'Assess safety training programs effectiveness', category: 'Training', type: 'routine', pointsAwarded: 20, isChallenge: false },
    { task: 'Prepare regulatory reports and submissions', category: 'Reporting', type: 'routine', pointsAwarded: 35, isChallenge: false },
    { 
      task: 'DGMS Challenge: Propose a new regulatory amendment based on recent industry best practices.', 
      category: 'Policy', 
      type: 'challenge', 
      pointsAwarded: 200, 
      isChallenge: true 
    },
  ]
};

// @desc    Get today's checklist for a user
// @route   GET /api/checklist/:userId
// @access  Private
export const getUserChecklist = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Role-based access control: Users can only access their own checklist
    // unless they are admin or dgms_officer
    if (req.user.id !== userId && 
        !['admin', 'dgms_officer'].includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. You can only view your own checklist.' 
      });
    }
    
    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find user to get their role
    const user = await User.findById(userId).select('role operationRole');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const normalizedRole = normalizeRole(user.role);
    const userOperationRole = user.operationRole;

    // Restrict checklist access to all roles
    if (!['employee', 'supervisor', 'admin', 'dgms_officer'].includes(normalizedRole)) {
      return res.status(403).json({ 
        success: false,
        message: 'Checklist is not available for your role.' 
      });
    }
    
    // Find existing checklist for today
    let checklist = await Checklist.findOne({
      user: userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    // If no checklist exists for today, create one with role-specific template
    if (!checklist) {
      // Prioritize operationRole template, then general role template, then default employee
      const templateKey = userOperationRole && checklistTemplates[userOperationRole] 
                          ? userOperationRole 
                          : normalizedRole;
      const template = checklistTemplates[templateKey] || checklistTemplates.employee;
      const completionBonus = normalizedRole === 'employee' ? 50 : 100; // Example bonus

      const itemsWithDetails = template.map(item => ({
        task: item.task,
        category: item.category,
        type: item.type || 'routine',
        pointsAwarded: item.pointsAwarded || 0,
        isChallenge: item.isChallenge || false,
        associatedContent: item.associatedContent || null
      }));

      checklist = await Checklist.create({
        user: userId,
        role: normalizedRole,
        operationRole: userOperationRole, // Store the specific operation role
        type: 'daily',
        completionBonus: completionBonus,
        items: itemsWithDetails,
        date: today
      });
    }
    
    const safeChecklist = checklist.toObject ? checklist.toObject() : checklist;
    safeChecklist.role = normalizedRole;
    safeChecklist.operationRole = checklist.operationRole; // Ensure operationRole is returned

    res.json({
      success: true,
      data: safeChecklist,
      userRole: normalizedRole,
      userOperationRole: userOperationRole
    });
  } catch (error) {
    console.error('Error in getUserChecklist:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching checklist' 
    });
  }
};

// @desc    Mark checklist item as completed/uncompleted
// @route   PATCH /api/checklist/complete
// @access  Private
export const completeChecklistItem = async (req, res) => {
  try {
    const { checklistId, itemId } = req.body;
    
    // Find the checklist
    const checklist = await Checklist.findById(checklistId).populate('user');
    
    if (!checklist) {
      return res.status(404).json({ 
        success: false,
        message: 'Checklist not found' 
      });
    }
    
    // Role-based access control: Users can only update their own checklist
    // Only employees and supervisors can have checklists
    if (req.user.id !== checklist.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. You can only update your own checklist.' 
      });
    }
    
    // Ensure only employees and supervisors can update checklists
    if (!isEmployeeRole(req.user.role) && req.user.role !== 'supervisor') {
      return res.status(403).json({ 
        success: false,
        message: 'Checklist is only available for employees and supervisors.' 
      });
    }
    
    // Find the specific item
    const item = checklist.items.id(itemId);
    
    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: 'Checklist item not found' 
      });
    }
    
    // Toggle the completion status
    item.completed = !item.completed;
    item.completedAt = item.completed ? new Date() : null;
    
    // Save the updated checklist
    await checklist.save();
    
    const safeChecklist = checklist.toObject ? checklist.toObject() : checklist;
    safeChecklist.role = normalizeRole(safeChecklist.role);

    res.json({
      success: true,
      data: safeChecklist,
      message: item.completed ? 'Task marked as completed' : 'Task marked as incomplete'
    });
  } catch (error) {
    console.error('Error in completeChecklistItem:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating checklist item' 
    });
  }
};

// @desc    Get compliance stats for supervisor dashboard
// @route   GET /api/checklist/stats
// @access  Private (Supervisor+)
export const getChecklistStats = async (req, res) => {
  try {
    // Get date range (default to last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    // Aggregate checklist completion data
    const stats = await Checklist.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            role: '$role'
          },
          totalItems: { $sum: 1 },
          completedItems: {
            $sum: { $cond: [{ $eq: ['$items.completed', true] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id.date',
          role: '$_id.role',
          totalItems: 1,
          completedItems: 1,
          complianceRate: {
            $multiply: [
              { $divide: ['$completedItems', '$totalItems'] },
              100
            ]
          }
        }
      },
      {
        $sort: { date: 1, role: 1 }
      }
    ]);
    
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDateKey = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString().split('T')[0];
};

// @desc    Report a missed pre-shift checklist so admins can intervene
// @route   POST /api/checklist/missed
// @access  Private
export const reportMissedChecklist = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    const targetUserId = userId || req.user._id;

    const employee = await User.findById(targetUserId).select('name role');
    if (!employee) {
      return res.status(404).json({ message: 'User not found' });
    }

    const snapshotDate = getDateKey();

    const existing = await BehaviorAlert.findOne({
      user: targetUserId,
      snapshotDate,
      type: 'checklist_missed',
      status: 'open'
    });

    if (existing) {
      return res.json({
        success: true,
        data: existing,
        duplicate: true,
        message: 'Checklist miss already logged for today'
      });
    }

    const alert = await BehaviorAlert.create({
      user: targetUserId,
      snapshotDate,
      type: 'checklist_missed',
      severity: 'medium',
      message: `${employee.name} has not completed the pre-shift checklist.`,
      metadata: {
        triggeredBy: req.user._id,
        employeeRole: employee.role,
        reason: reason || 'pre_shift_check'
      }
    });

    res.status(201).json({
      success: true,
      data: alert,
      message: 'Admin notified about missed checklist'
    });
  } catch (error) {
    console.error('Error reporting missed checklist:', error);
    res.status(500).json({ message: 'Server error while reporting missed checklist' });
  }
};

// @desc    Get all open missed checklist alerts
// @route   GET /api/checklist/missed/open
// @access  Private (Admin, Supervisor, DGMS)
export const getMissedChecklistAlerts = async (_req, res) => {
  try {
    const alerts = await BehaviorAlert.find({
      type: 'checklist_missed',
      status: 'open'
    })
      .sort({ createdAt: -1 })
      .populate('user', 'name role');

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching missed checklist alerts:', error);
    res.status(500).json({ message: 'Server error while fetching alerts' });
  }
};

// @desc    Acknowledge a missed checklist alert
// @route   PATCH /api/checklist/missed/:alertId/ack
// @access  Private (Admin, Supervisor, DGMS)
export const acknowledgeMissedChecklistAlert = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await BehaviorAlert.findById(alertId);
    if (!alert || alert.type !== 'checklist_missed') {
      return res.status(404).json({ message: 'Checklist alert not found' });
    }

    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date();
    await alert.save();

    res.json({
      success: true,
      data: alert,
      message: 'Checklist alert acknowledged'
    });
  } catch (error) {
    console.error('Error acknowledging checklist alert:', error);
    res.status(500).json({ message: 'Server error while acknowledging alert' });
  }
};

// @desc    Get a list of employees with incomplete daily checklists
// @route   GET /api/checklist/incomplete
// @access  Private (Admin, Supervisor, DGMS)
export const getIncompleteChecklists = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find all checklists for today
    const incompleteChecklists = await Checklist.find({
      date: {
        $gte: today,
        $lt: tomorrow
      },
      'items.completed': false // At least one item is not completed
    })
      .populate('user', 'name email role')
      .select('user date role items');

    // Filter out checklists where all items are completed (due to the $not operator being tricky with arrays)
    const trulyIncomplete = incompleteChecklists.filter(checklist => 
      checklist.items.some(item => !item.completed)
    );

    res.json({
      success: true,
      data: trulyIncomplete
    });
  } catch (error) {
    console.error('Error fetching incomplete checklists:', error);
    res.status(500).json({ message: 'Server error while fetching incomplete checklists' });
  }
};