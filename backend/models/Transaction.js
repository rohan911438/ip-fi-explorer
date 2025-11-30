import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset'
  },
  investment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'purchase',
      'sale',
      'royalty_payment',
      'dividend_payment',
      'deposit',
      'withdrawal',
      'fee',
      'refund',
      'transfer'
    ]
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['USD', 'ETH', 'MATIC'],
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'processing'],
    default: 'pending'
  },
  blockchain: {
    transactionHash: { type: String },
    blockNumber: { type: Number },
    gasUsed: { type: Number },
    gasFee: { type: Number },
    confirmations: { type: Number, default: 0 }
  },
  payment: {
    method: {
      type: String,
      enum: ['crypto', 'credit_card', 'bank_transfer', 'paypal', 'stripe'],
      default: 'crypto'
    },
    processor: { type: String },
    processorTransactionId: { type: String },
    processorFee: { type: Number, default: 0 }
  },
  details: {
    description: { type: String },
    sharesTransferred: { type: Number },
    pricePerShare: { type: Number },
    fromAddress: { type: String },
    toAddress: { type: String },
    reference: { type: String }
  },
  fees: {
    platformFee: { type: Number, default: 0 },
    networkFee: { type: Number, default: 0 },
    processingFee: { type: Number, default: 0 },
    totalFees: { type: Number, default: 0 }
  },
  metadata: {
    ipAddress: { type: String },
    userAgent: { type: String },
    source: { type: String },
    notes: { type: String }
  }
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ asset: 1, type: 1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ 'blockchain.transactionHash': 1 });
transactionSchema.index({ type: 1, createdAt: -1 });

// Calculate total fees
transactionSchema.pre('save', function(next) {
  this.fees.totalFees = 
    (this.fees.platformFee || 0) + 
    (this.fees.networkFee || 0) + 
    (this.fees.processingFee || 0);
  next();
});

// Update transaction status
transactionSchema.methods.updateStatus = async function(newStatus, blockchainData = {}) {
  this.status = newStatus;
  
  if (blockchainData.transactionHash) {
    this.blockchain.transactionHash = blockchainData.transactionHash;
  }
  if (blockchainData.blockNumber) {
    this.blockchain.blockNumber = blockchainData.blockNumber;
  }
  if (blockchainData.gasUsed) {
    this.blockchain.gasUsed = blockchainData.gasUsed;
  }
  
  await this.save();
  return this;
};

export default mongoose.model('Transaction', transactionSchema);