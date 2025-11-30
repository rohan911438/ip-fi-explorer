import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
  investor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  sharesOwned: {
    type: Number,
    required: true,
    min: [1, 'Must own at least 1 share']
  },
  purchasePrice: {
    type: Number,
    required: true
  },
  totalInvestment: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['USD', 'ETH', 'MATIC'],
    default: 'USD'
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  blockchain: {
    transactionHash: { type: String },
    blockNumber: { type: Number },
    gasUsed: { type: Number },
    gasFee: { type: Number }
  },
  earnings: {
    totalRoyalties: { type: Number, default: 0 },
    lastRoyaltyPayment: { type: Date },
    totalDividends: { type: Number, default: 0 },
    capitalGains: { type: Number, default: 0 }
  },
  currentValue: {
    type: Number,
    default: 0
  },
  roi: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'pending_sale', 'locked'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
investmentSchema.index({ investor: 1, asset: 1 });
investmentSchema.index({ investor: 1, status: 1 });
investmentSchema.index({ asset: 1 });
investmentSchema.index({ purchaseDate: -1 });

// Calculate ROI
investmentSchema.methods.calculateROI = function() {
  const totalReturns = this.earnings.totalRoyalties + this.earnings.totalDividends + this.earnings.capitalGains;
  this.roi = ((totalReturns / this.totalInvestment) * 100);
  return this.roi;
};

// Update current value based on market conditions
investmentSchema.methods.updateCurrentValue = async function() {
  const asset = await mongoose.model('Asset').findById(this.asset);
  if (asset) {
    this.currentValue = this.sharesOwned * asset.ownership.sharePrice;
    this.earnings.capitalGains = this.currentValue - this.totalInvestment;
    this.calculateROI();
    await this.save();
  }
};

export default mongoose.model('Investment', investmentSchema);