import mongoose from 'mongoose';

const checklistItemSchema = new mongoose.Schema({
  task: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  type: {
    type: String,
    enum: ['routine', 'challenge', 'review'],
    default: 'routine'
  },
  pointsAwarded: {
    type: Number,
    default: 0
  },
  isChallenge: {
    type: Boolean,
    default: false
  },
  associatedContent: {
    type: {
      type: String,
      enum: ['video', 'caseStudy', 'hazard'],
      required: false
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    url: {
      type: String,
      required: false
    }
  }
});

const checklistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'special'],
    default: 'daily'
  },
  completionBonus: {
    type: Number,
    default: 0
  },
  items: [checklistItemSchema]
}, {
  timestamps: true
});

const Checklist = mongoose.model('Checklist', checklistSchema);

export default Checklist;