import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const OPERATION_ROLES = [
  'Miner',
  'Driller',
  'Blaster',
  'LHD Operator',
  'Roof Bolter',
  'Electrician',
  'Foreman',
  'Ventilation',
  'Safety Officer',
  'Pump Operator',
  'Surveyor',
  'Rescue Team',
];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['employee', 'supervisor', 'admin', 'dgms_officer'],
    default: 'employee'
  },
  operationRole: {
    type: String,
    enum: OPERATION_ROLES,
    default: 'Miner'
  },
  preferredLanguage: {
    type: String,
    enum: ['english', 'telugu', 'tamil', 'malayalam'],
    default: 'english'
  },
  // New optional shift assignment fields, mainly for employees and supervisors
  shiftLocation: {
    type: String,
    trim: true,
  },
  shiftDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;