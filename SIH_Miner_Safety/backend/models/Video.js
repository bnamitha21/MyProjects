import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['accident_case_study', 'dgms_advisory', 'testimonial', 'best_practice'],
    required: true
  },
  targetRoles: {
    type: [String],
    enum: ['worker', 'supervisor', 'admin', 'dgms_officer', 'all'],
    default: ['all']
  },
  languages: {
    type: [String],
    enum: ['english', 'hindi', 'telugu'],
    default: ['english']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Video = mongoose.model('Video', videoSchema);

export default Video;