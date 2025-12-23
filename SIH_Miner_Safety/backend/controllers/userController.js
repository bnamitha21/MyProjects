import User, { OPERATION_ROLES } from '../models/User.js';
import { EMPLOYEE_ROLE_FILTER, isEmployeeRole, normalizeRole } from '../utils/roleUtils.js';

// @desc    Get all employees and supervisors
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: [...EMPLOYEE_ROLE_FILTER, 'supervisor'] }
    }).select('-password');

    const normalizedUsers = users.map((user) => {
      const safe = user.toObject();
      safe.role = normalizeRole(safe.role);
      return safe;
    });

    res.json(normalizedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a user shift location and date
// @route   PUT /api/users/:id/shift
// @access  Private/Admin
export const updateUserShift = async (req, res) => {
  try {
    const { id } = req.params;
    const { shiftLocation, shiftDate } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow assigning shifts to employees and supervisors
    if (!['supervisor'].includes(user.role) && !isEmployeeRole(user.role)) {
      return res.status(400).json({ message: 'Shift can only be assigned to employees and supervisors' });
    }

    if (typeof shiftLocation === 'string') {
      user.shiftLocation = shiftLocation.trim();
    }

    if (shiftDate) {
      const date = new Date(shiftDate);
      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({ message: 'Invalid shift date' });
      }
      user.shiftDate = date;
    }

    await user.save();

    const safeUser = user.toObject();
    safeUser.role = normalizeRole(safeUser.role);
    delete safeUser.password;

    res.json({
      message: 'Shift assignment updated successfully',
      user: safeUser,
    });
  } catch (error) {
    console.error('Error updating user shift:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update employee operational role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
export const updateUserOperationRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { operationRole } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!isEmployeeRole(user.role)) {
      return res.status(400).json({ message: 'Only employees have operational roles' });
    }

    if (!operationRole) {
      return res.status(400).json({ message: 'operationRole is required' });
    }

    if (!OPERATION_ROLES.includes(operationRole)) {
      return res.status(400).json({ message: 'Invalid operation role' });
    }

    user.operationRole = operationRole;
    await user.save();

    const safeUser = user.toObject();
    safeUser.role = normalizeRole(safeUser.role);
    delete safeUser.password;

    res.json({
      message: 'Employee role updated successfully',
      user: safeUser,
    });
  } catch (error) {
    console.error('Error updating employee role:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
