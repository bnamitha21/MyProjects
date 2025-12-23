import mongoose from 'mongoose';

const engagementEventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'app_login',
      'app_logout',
      'checklist_viewed',
      'checklist_item_completed',
      'checklist_completed',
      'ppe_confirmed',
      'ppe_skipped',
      'video_started',
      'video_progress',
      'video_completed',
      'hazard_reported',
      'instruction_acknowledged',
      'quiz_completed',
      'nudge_acknowledged',
    ],
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  occurredAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

engagementEventSchema.index({ user: 1, occurredAt: -1 });
engagementEventSchema.index({ type: 1, occurredAt: -1 });

const EngagementEvent = mongoose.model('EngagementEvent', engagementEventSchema);

export default EngagementEvent;

