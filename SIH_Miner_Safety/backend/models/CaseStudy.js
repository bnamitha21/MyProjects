import mongoose from 'mongoose';

const { Schema } = mongoose;

const TimelineEntrySchema = new Schema({
  timestampLabel: String,
  description: String,
}, { _id: false });

const RootCauseSchema = new Schema({
  type: {
    type: String,
    enum: ['human', 'technical', 'environmental', 'organizational', 'other'],
    default: 'other',
  },
  description: String,
}, { _id: false });

const ActionSchema = new Schema({
  title: String,
  description: String,
  responsibleRole: String,
}, { _id: false });

const ChecklistItemSchema = new Schema({
  text: String,
  role: {
    type: String,
    enum: ['worker', 'supervisor', 'admin'],
    default: 'worker',
  },
}, { _id: false });

const AnnotationSchema = new Schema({
  label: String,
  description: String,
  x: Number,
  y: Number,
}, { _id: false });

const AnnotatedMediaSchema = new Schema({
  url: String,
  caption: String,
  annotations: [AnnotationSchema],
}, { _id: false });

const QuizQuestionSchema = new Schema({
  question: String,
  options: [String],
  correctOption: Number,
  explanation: String,
}, { _id: false });

const CaseStudySchema = new Schema({
  title: { type: String, required: true },
  sourceType: {
    type: String,
    enum: ['DGMS', 'INTERNAL', 'INDUSTRY', 'TESTIMONIAL', 'CCTV', 'OTHER'],
    default: 'INTERNAL',
  },
  sourceDocumentUrl: String,
  date: { type: Date, default: Date.now },
  location: { type: String, default: 'Confidential' },
  mineSection: String,
  severity: {
    type: String,
    enum: ['fatal', 'major', 'minor', 'near_miss'],
    default: 'minor',
  },
  tags: [{ type: String }],
  hazardTags: [{ type: String }],
  relevanceRoles: [{ type: String }],
  quickSummary: String,
  quickSummaryLocal: {
    type: Map,
    of: String,
  },
  supervisorSummary: String,
  timeline: [TimelineEntrySchema],
  rootCauses: [RootCauseSchema],
  immediateActions: [ActionSchema],
  preventiveChecklist: [ChecklistItemSchema],
  microVideo: {
    url: String,
    thumbnail: String,
    durationSeconds: Number,
  },
  annotatedMedia: [AnnotatedMediaSchema],
  quiz: [QuizQuestionSchema],
  relatedReferences: [{
    label: String,
    url: String,
  }],
  engagementStats: {
    views: { type: Number, default: 0 },
    completions: { type: Number, default: 0 },
    averageQuizScore: { type: Number, default: 0 },
  },
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'published'],
    default: 'draft',
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  metadata: {
    casualties: Number,
    equipmentInvolved: String,
    weather: String,
    shift: String,
  },
}, { timestamps: true });

export default mongoose.model('CaseStudy', CaseStudySchema);

