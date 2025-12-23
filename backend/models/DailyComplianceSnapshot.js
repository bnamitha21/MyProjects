import mongoose from 'mongoose';

const metricsSchema = new mongoose.Schema({
  checklistsCompleted: { type: Number, default: 0 },
  checklistItemsCompleted: { type: Number, default: 0 },
  totalChecklistItems: { type: Number, default: 0 },
  checklistCompletionRate: { type: Number, default: 0 },
  videosStarted: { type: Number, default: 0 },
  videosCompleted: { type: Number, default: 0 },
  videoMilestones: { type: Number, default: 0 },
  videoWatchSeconds: { type: Number, default: 0 },
  hazardsReported: { type: Number, default: 0 },
  acknowledgements: { type: Number, default: 0 },
  ppeChecksPassed: { type: Number, default: 0 },
  ppeChecksFailed: { type: Number, default: 0 },
  quizAttempts: { type: Number, default: 0 },
  quizAverageScore: { type: Number, default: 0 },
  engagementMinutes: { type: Number, default: 0 },
  nudgesAcknowledged: { type: Number, default: 0 },
  loginCount: { type: Number, default: 0 },
}, { _id: false });

const dailyComplianceSnapshotSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  metrics: {
    type: metricsSchema,
    default: () => ({}),
  },
  complianceScore: {
    type: Number,
    default: 0,
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  streakCount: {
    type: Number,
    default: 0,
  },
  streakSeeded: {
    type: Boolean,
    default: false,
  },
  lastEventType: {
    type: String,
  },
  lastEventAt: {
    type: Date,
  },
  lastEventMetadata: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

dailyComplianceSnapshotSchema.index({ user: 1, date: 1 }, { unique: true });
dailyComplianceSnapshotSchema.index({ date: 1, riskLevel: 1 });

const DailyComplianceSnapshot = mongoose.model('DailyComplianceSnapshot', dailyComplianceSnapshotSchema);

export default DailyComplianceSnapshot;

