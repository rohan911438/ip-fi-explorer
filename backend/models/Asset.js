import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Asset title is required'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Asset description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['digital_art', 'patent', 'music', 'character_ip', 'trademark', 'copyright', 'trade_secret']
  },
  category: {
    type: String,
    required: true
  },
  subcategory: {
    type: String
  },
  images: [{
    url: { type: String, required: true },
    alt: { type: String },
    isPrimary: { type: Boolean, default: false }
  }],
  files: [{
    url: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number }
  }],
  blockchain: {
    contractAddress: { type: String },
    tokenId: { type: String },
    chainId: { type: Number, default: 1 },
    transactionHash: { type: String },
    isOnChain: { type: Boolean, default: false }
  },
  ownership: {
    totalShares: {
      type: Number,
      required: true,
      min: [1, 'Total shares must be at least 1']
    },
    availableShares: {
      type: Number,
      required: true
    },
    sharePrice: {
      type: Number,
      required: true,
      min: [0.01, 'Share price must be at least $0.01']
    },
    currency: {
      type: String,
      enum: ['USD', 'ETH', 'MATIC'],
      default: 'USD'
    }
  },
  financials: {
    totalValue: { type: Number, required: true },
    minimumInvestment: { type: Number, default: 1 },
    expectedROI: { type: Number },
    royaltyRate: { type: Number, default: 0 },
    totalRoyaltiesPaid: { type: Number, default: 0 },
    lastRoyaltyPayment: { type: Date }
  },
  metrics: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    totalInvestors: { type: Number, default: 0 },
    totalInvested: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'approved', 'live', 'sold_out', 'suspended', 'archived'],
    default: 'draft'
  },
  verification: {
    isVerified: { type: Boolean, default: false },
    verificationDate: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    documents: [{
      name: String,
      url: String,
      uploadDate: { type: Date, default: Date.now }
    }]
  },
  licensing: {
    licenseType: {
      type: String,
      enum: ['exclusive', 'non_exclusive', 'creative_commons', 'custom'],
      default: 'non_exclusive'
    },
    terms: { type: String },
    restrictions: [String],
    allowDerivatives: { type: Boolean, default: false },
    allowCommercialUse: { type: Boolean, default: true }
  },
  tags: [String],
  featured: { type: Boolean, default: false },
  trending: { type: Boolean, default: false },
  launchDate: { type: Date },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Indexes for better query performance
assetSchema.index({ type: 1, status: 1 });
assetSchema.index({ creator: 1 });
assetSchema.index({ 'ownership.sharePrice': 1 });
assetSchema.index({ tags: 1 });
assetSchema.index({ featured: 1, trending: 1 });
assetSchema.index({ createdAt: -1 });

// Virtual for calculating funding percentage
assetSchema.virtual('fundingPercentage').get(function() {
  return ((this.ownership.totalShares - this.ownership.availableShares) / this.ownership.totalShares) * 100;
});

// Update available shares when investment is made
assetSchema.methods.updateShares = function(sharesPurchased) {
  this.ownership.availableShares -= sharesPurchased;
  this.metrics.totalInvested += sharesPurchased * this.ownership.sharePrice;
  this.metrics.totalInvestors += 1;
  
  if (this.ownership.availableShares <= 0) {
    this.status = 'sold_out';
  }
  
  return this.save();
};

export default mongoose.model('Asset', assetSchema);