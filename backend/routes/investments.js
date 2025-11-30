import express from 'express';
import Asset from '../models/Asset.js';
import Investment from '../models/Investment.js';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';
import { validateInvestment } from '../middleware/validation.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
import { transferShares } from '../services/blockchain.js';
import { sendEmail, emailTemplates } from '../utils/email.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @desc    Create investment
// @route   POST /api/investments
// @access  Private
router.post('/', protect, validateInvestment, async (req, res) => {
  try {
    const { assetId, shares, paymentMethod } = req.body;

    // Find asset
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return sendError(res, 'Asset not found', 404);
    }

    // Check if asset is available for investment
    if (asset.status !== 'live') {
      return sendError(res, 'Asset is not available for investment', 400);
    }

    // Check if enough shares available
    if (asset.ownership.availableShares < shares) {
      return sendError(res, 'Not enough shares available', 400);
    }

    // Calculate total investment amount
    const totalInvestment = shares * asset.ownership.sharePrice;

    // Check user investment limit (if applicable)
    if (req.user.totalInvested + totalInvestment > req.user.investmentLimit) {
      return sendError(res, 'Investment exceeds your limit', 400);
    }

    // Create transaction record
    const transaction = await Transaction.create({
      user: req.user._id,
      asset: assetId,
      type: 'purchase',
      amount: totalInvestment,
      currency: asset.ownership.currency,
      payment: {
        method: paymentMethod
      },
      details: {
        sharesTransferred: shares,
        pricePerShare: asset.ownership.sharePrice,
        description: `Purchase of ${shares} shares in ${asset.title}`
      },
      fees: {
        platformFee: totalInvestment * 0.025, // 2.5% platform fee
        processingFee: paymentMethod === 'credit_card' ? totalInvestment * 0.029 : 0
      }
    });

    // In a real app, you would process the payment here
    // For now, we'll simulate a successful payment
    
    // Create investment record
    const investment = await Investment.create({
      investor: req.user._id,
      asset: assetId,
      sharesOwned: shares,
      purchasePrice: asset.ownership.sharePrice,
      totalInvestment,
      currency: asset.ownership.currency,
      currentValue: totalInvestment
    });

    // Update asset shares
    await asset.updateShares(shares);

    // Update user statistics
    req.user.totalInvested += totalInvestment;
    await req.user.save();

    // Update transaction status
    await transaction.updateStatus('completed');
    transaction.investment = investment._id;
    await transaction.save();

    // Transfer shares on blockchain (if applicable)
    if (asset.blockchain.isOnChain && req.user.walletAddress) {
      try {
        const blockchainResult = await transferShares(
          asset.blockchain.tokenId,
          asset.creator.walletAddress,
          req.user.walletAddress,
          shares
        );
        
        transaction.blockchain = {
          transactionHash: blockchainResult.transactionHash,
          blockNumber: blockchainResult.blockNumber,
          gasUsed: blockchainResult.gasUsed
        };
        await transaction.save();
      } catch (blockchainError) {
        logger.error('Blockchain share transfer failed:', blockchainError);
      }
    }

    // Send confirmation email
    try {
      await sendEmail({
        email: req.user.email,
        ...emailTemplates.investmentConfirmation({
          assetTitle: asset.title,
          shares,
          totalAmount: totalInvestment,
          transactionId: transaction._id
        })
      });
    } catch (emailError) {
      logger.error('Failed to send investment confirmation email:', emailError);
    }

    // Populate investment data
    await investment.populate('asset', 'title type images');

    // Emit real-time update
    if (global.io) {
      global.io.to(`user-${req.user._id}`).emit('investment-created', { investment });
      global.io.emit('asset-updated', { assetId, availableShares: asset.ownership.availableShares });
    }

    sendSuccess(res, { investment, transaction }, 'Investment created successfully', 201);
  } catch (error) {
    logger.error('Create investment error:', error);
    sendError(res, 'Failed to create investment', 500);
  }
});

// @desc    Get user investments
// @route   GET /api/investments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const investments = await Investment.find({ investor: req.user._id })
      .populate('asset', 'title type images ownership financials creator')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Investment.countDocuments({ investor: req.user._id });

    sendPaginated(res, investments, page, limit, total, 'Investments retrieved successfully');
  } catch (error) {
    logger.error('Get investments error:', error);
    sendError(res, 'Failed to retrieve investments', 500);
  }
});

// @desc    Get single investment
// @route   GET /api/investments/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      investor: req.user._id
    }).populate('asset', 'title type images ownership financials creator');

    if (!investment) {
      return sendError(res, 'Investment not found', 404);
    }

    sendSuccess(res, investment, 'Investment retrieved successfully');
  } catch (error) {
    logger.error('Get investment error:', error);
    sendError(res, 'Failed to retrieve investment', 500);
  }
});

// @desc    Update investment (for current value calculation)
// @route   PUT /api/investments/:id/value
// @access  Private
router.put('/:id/value', protect, async (req, res) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      investor: req.user._id
    });

    if (!investment) {
      return sendError(res, 'Investment not found', 404);
    }

    await investment.updateCurrentValue();

    sendSuccess(res, investment, 'Investment value updated successfully');
  } catch (error) {
    logger.error('Update investment value error:', error);
    sendError(res, 'Failed to update investment value', 500);
  }
});

export default router;