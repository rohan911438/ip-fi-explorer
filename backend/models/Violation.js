import mongoose from 'mongoose';

const violationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  detectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IPDetection',
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'text', 'trademark', 'patent', 'code'],
    required: true,
    index: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['detected', 'investigating', 'action_taken', 'resolved', 'false_positive'],
    default: 'detected',
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  evidence: {
    originalContent: mongoose.Schema.Types.Mixed,
    violatingContent: mongoose.Schema.Types.Mixed,
    screenshots: [String],
    metadata: mongoose.Schema.Types.Mixed,
    analysisResults: mongoose.Schema.Types.Mixed,
    blockchainProof: {
      transactionHash: String,
      blockNumber: Number,
      timestamp: Date,
      ipfsHash: String
    }
  },
  actions: [{
    type: {
      type: String,
      enum: ['takedown', 'legal_notice', 'evidence_collection', 'manual_review'],
      required: true
    },
    takenAt: {
      type: Date,
      required: true
    },
    takenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    result: mongoose.Schema.Types.Mixed,
    notes: String
  }],
  relatedAssets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset'
  }],
  platformResponse: {
    contacted: Boolean,
    contactedAt: Date,
    response: String,
    responseAt: Date,
    resolved: Boolean,
    resolvedAt: Date
  },
  legalStatus: {
    ceaseAndDesistSent: Boolean,
    ceaseAndDesistDate: Date,
    legalActionInitiated: Boolean,
    legalActionDate: Date,
    outcome: String
  },
  tags: [String],
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  detectedAt: {
    type: Date,
    required: true,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: Date,
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
violationSchema.index({ userId: 1, detectedAt: -1 });
violationSchema.index({ userId: 1, status: 1 });
violationSchema.index({ userId: 1, type: 1, severity: 1 });
violationSchema.index({ confidence: -1 });
violationSchema.index({ 'evidence.blockchainProof.transactionHash': 1 });

// Virtual for age calculation
violationSchema.virtual('ageInDays').get(function() {
  return Math.floor((new Date() - this.detectedAt) / (1000 * 60 * 60 * 24));
});

// Virtual for action count
violationSchema.virtual('actionCount').get(function() {
  return this.actions ? this.actions.length : 0;
});

// Static method to get violations by severity
violationSchema.statics.getBySeverity = function(userId, severity) {
  return this.find({ userId, severity }).sort({ detectedAt: -1 });
};

// Static method to get recent violations
violationSchema.statics.getRecent = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ detectedAt: -1 })
    .limit(limit)
    .populate('detectionId', 'algorithm confidence');
};

// Instance method to mark as resolved
violationSchema.methods.markResolved = function(notes = '') {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  if (notes) this.notes = notes;
  return this.save();
};

// Instance method to add action
violationSchema.methods.addAction = function(actionType, result, takenBy, notes = '') {
  this.actions.push({
    type: actionType,
    takenAt: new Date(),
    takenBy,
    result,
    notes
  });
  
  // Update status based on action
  if (actionType === 'takedown' || actionType === 'legal_notice') {
    this.status = 'action_taken';
  }
  
  return this.save();
};

// Pre-save middleware to update timestamps
violationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Violation = mongoose.model('Violation', violationSchema);

export default Violation;