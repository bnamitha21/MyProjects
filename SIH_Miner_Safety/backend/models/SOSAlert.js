import mongoose from 'mongoose';

const sosAlertSchema = new mongoose.Schema({
  triggeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  hazardType: {
    type: String,
    enum: ['underground_fire', 'gas_leakage', 'water_leak', 'rock_fall', 'blasting_error'],
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude] or [x, y, z] for mine coordinates
      default: [0, 0]
    },
    description: String, // e.g., "Level 2, Section A, Panel 3"
    zoneId: String, // Mine zone identifier
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved'],
    default: 'active',
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  acknowledgedAt: {
    type: Date,
  },
  resolvedAt: {
    type: Date,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Index for quick lookups
sosAlertSchema.index({ status: 1, createdAt: -1 });
sosAlertSchema.index({ triggeredBy: 1, createdAt: -1 });
sosAlertSchema.index({ location: '2dsphere' });

const SOSAlert = mongoose.model('SOSAlert', sosAlertSchema);

export default SOSAlert;

