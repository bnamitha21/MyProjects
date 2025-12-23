import mongoose from 'mongoose';

const { Schema } = mongoose;

const CaseEngagementSchema = new Schema({
  case: {
    type: Schema.Types.ObjectId,
    ref: 'CaseStudy',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  viewedAt: Date,
  completedAt: Date,
  quizScore: Number,
  notes: String,
  synced: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

CaseEngagementSchema.index({ case: 1, user: 1 }, { unique: true });

export default mongoose.model('CaseEngagement', CaseEngagementSchema);

