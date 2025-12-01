import mongoose from 'mongoose';

const ipDetectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['image', 'text', 'comprehensive', 'trademark', 'patent'],
    required: true
  },
  algorithm: {
    type: String,
    enum: ['google_vision', 'nlp_similarity', 'blockchain_analysis', 'custom_ai'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  parameters: {
    targets: [{
      url: String,
      content: String,
      type: String,
      metadata: mongoose.Schema.Types.Mixed
    }],
    referenceData: mongoose.Schema.Types.Mixed,
    threshold: {
      type: Number,
      min: 0,
      max: 100,
      default: 75
    },
    platforms: [String],
    scanDepth: {
      type: String,
      enum: ['surface', 'deep', 'comprehensive'],
      default: 'surface'
    },
    includeMetadata: {
      type: Boolean,
      default: true
    }
  },
  results: {
    totalScanned: {
      type: Number,
      default: 0
    },
    violationsFound: {
      type: Number,
      default: 0
    },
    averageConfidence: {
      type: Number,
      default: 0
    },
    processingTime: Number, // in milliseconds
    apiCallsUsed: Number,
    detailedResults: mongoose.Schema.Types.Mixed
  },
  performance: {
    startTime: Date,
    endTime: Date,
    duration: Number, // in seconds
    resourcesUsed: {
      cpu: Number,
      memory: Number,
      apiCalls: Number
    }
  },
  configuration: {
    batchSize: {
      type: Number,
      default: 10
    },
    timeout: {
      type: Number,
      default: 30000 // 30 seconds
    },
    retryAttempts: {
      type: Number,
      default: 3
    },
    enableCache: {
      type: Boolean,
      default: true
    }
  },
  apiUsage: {
    googleVision: {
      requests: Number,
      cost: Number
    },
    openAI: {
      tokens: Number,
      cost: Number
    },
    custom: {
      requests: Number,
      cost: Number
    }
  },
  scheduledFor: Date,
  startedAt: Date,
  completedAt: Date,
  error: {
    message: String,
    code: String,
    stack: String,
    timestamp: Date
  },
  logs: [{
    level: {
      type: String,
      enum: ['info', 'warn', 'error', 'debug'],
      default: 'info'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: mongoose.Schema.Types.Mixed
  }],
  tags: [String],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringConfig: {
    frequency: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly']
    },
    interval: Number,
    nextRun: Date,
    enabled: Boolean
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
ipDetectionSchema.index({ userId: 1, createdAt: -1 });
ipDetectionSchema.index({ userId: 1, status: 1 });
ipDetectionSchema.index({ status: 1, scheduledFor: 1 });
ipDetectionSchema.index({ 'recurringConfig.nextRun': 1, 'recurringConfig.enabled': 1 });

// Virtual for progress percentage
ipDetectionSchema.virtual('progress').get(function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'failed' || this.status === 'cancelled') return 0;
  if (this.status === 'running') {
    // Calculate based on targets processed
    const total = this.parameters?.targets?.length || 1;
    const processed = this.results?.totalScanned || 0;
    return Math.min(Math.floor((processed / total) * 100), 99);
  }
  return 0;
});

// Virtual for duration calculation
ipDetectionSchema.virtual('durationSeconds').get(function() {
  if (this.performance?.startTime && this.performance?.endTime) {
    return Math.floor((this.performance.endTime - this.performance.startTime) / 1000);
  }
  return null;
});

// Virtual for success rate
ipDetectionSchema.virtual('successRate').get(function() {
  const total = this.results?.totalScanned || 0;
  const violations = this.results?.violationsFound || 0;
  return total > 0 ? Math.floor((violations / total) * 100) : 0;
});

// Static method to get active detections
ipDetectionSchema.statics.getActive = function(userId) {
  return this.find({ 
    userId, 
    status: { $in: ['pending', 'running'] } 
  }).sort({ createdAt: -1 });
};

// Static method to get detection history
ipDetectionSchema.statics.getHistory = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('type algorithm status results performance createdAt completedAt');
};

// Static method to get scheduled detections
ipDetectionSchema.statics.getScheduled = function() {
  return this.find({
    'recurringConfig.enabled': true,
    'recurringConfig.nextRun': { $lte: new Date() }
  });
};

// Instance method to start detection
ipDetectionSchema.methods.start = function() {
  this.status = 'running';
  this.startedAt = new Date();
  this.performance.startTime = new Date();
  return this.save();
};

// Instance method to complete detection
ipDetectionSchema.methods.complete = function(results = {}) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.performance.endTime = new Date();
  
  if (this.performance.startTime) {
    this.performance.duration = Math.floor(
      (this.performance.endTime - this.performance.startTime) / 1000
    );
  }
  
  if (results) {
    this.results = { ...this.results, ...results };
  }
  
  return this.save();
};

// Instance method to fail detection
ipDetectionSchema.methods.fail = function(error) {
  this.status = 'failed';
  this.completedAt = new Date();
  this.performance.endTime = new Date();
  this.error = {
    message: error.message,
    code: error.code || 'UNKNOWN',
    stack: error.stack,
    timestamp: new Date()
  };
  return this.save();
};

// Instance method to add log entry
ipDetectionSchema.methods.addLog = function(level, message, metadata = {}) {
  this.logs.push({
    level,
    message,
    metadata,
    timestamp: new Date()
  });
  return this.save();
};

// Instance method to update progress
ipDetectionSchema.methods.updateProgress = function(scanned, found = 0) {
  this.results.totalScanned = scanned;
  if (found > 0) this.results.violationsFound = found;
  return this.save();
};

// Pre-save middleware
ipDetectionSchema.pre('save', function(next) {
  // Update next run for recurring detections
  if (this.isRecurring && this.status === 'completed' && this.recurringConfig?.enabled) {
    const { frequency, interval = 1 } = this.recurringConfig;
    const now = new Date();
    
    switch (frequency) {
      case 'hourly':
        this.recurringConfig.nextRun = new Date(now.getTime() + (interval * 60 * 60 * 1000));
        break;
      case 'daily':
        this.recurringConfig.nextRun = new Date(now.getTime() + (interval * 24 * 60 * 60 * 1000));
        break;
      case 'weekly':
        this.recurringConfig.nextRun = new Date(now.getTime() + (interval * 7 * 24 * 60 * 60 * 1000));
        break;
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + interval);
        this.recurringConfig.nextRun = nextMonth;
        break;
    }
  }
  
  next();
});

const IPDetection = mongoose.model('IPDetection', ipDetectionSchema);

export default IPDetection;