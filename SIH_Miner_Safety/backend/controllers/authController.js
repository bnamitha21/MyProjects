import User, { OPERATION_ROLES } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { normalizeRole } from '../utils/roleUtils.js';

const SUPPORTED_LANGUAGES = ['english', 'telugu', 'tamil', 'malayalam'];

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, preferredLanguage, operationRole } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    let resolvedOperationRole = operationRole;
    if (!OPERATION_ROLES.includes(operationRole)) {
      resolvedOperationRole = OPERATION_ROLES[0];
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'employee',
      operationRole: resolvedOperationRole,
      preferredLanguage: preferredLanguage || 'english',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: normalizeRole(user.role),
        operationRole: user.operationRole,
        preferredLanguage: user.preferredLanguage,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: normalizeRole(user.role),
        operationRole: user.operationRole,
        preferredLanguage: user.preferredLanguage,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (user) {
      const safeUser = user.toObject();
      safeUser.role = normalizeRole(safeUser.role);
      safeUser.operationRole = user.operationRole; // Include operationRole
      res.json(safeUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update language preference
// @route   PUT /api/auth/preferences/language
// @access  Private
export const updateLanguagePreference = async (req, res) => {
  try {
    const { preferredLanguage } = req.body;

    if (!SUPPORTED_LANGUAGES.includes(preferredLanguage)) {
      return res.status(400).json({
        message: 'Unsupported language option'
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.preferredLanguage = preferredLanguage;
    await user.save();

    res.json({
      message: 'Language preference updated',
      preferredLanguage: user.preferredLanguage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};