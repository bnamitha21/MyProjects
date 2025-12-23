import mongoose from 'mongoose';

const behaviorAlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  snapshotDate: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['low_compliance', 'ppe_non_compliance', 'inactive', 'video_avoidance', 'checklist_missed', 'custom'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low',
  },
  status: {
    type: String,
    enum: ['open', 'acknowledged'],
    default: 'open',
  },
  message: {
    type: String,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  acknowledgedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

behaviorAlertSchema.index({ user: 1, snapshotDate: 1, type: 1, status: 1 });

const BehaviorAlert = mongoose.model('BehaviorAlert', behaviorAlertSchema);

export default BehaviorAlert;

