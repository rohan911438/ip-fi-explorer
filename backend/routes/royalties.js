import express from 'express';
import Investment from '../models/Investment.js';
import Transaction from '../models/Transaction.js';
import Asset from '../models/Asset.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
import { distributeRoyalties } from '../services/blockchain.js';
import { sendEmail, emailTemplates } from '../utils/email.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @desc    Distribute royalties for an asset
// @route   POST /api/royalties/distribute/:assetId
// @access  Private (Asset Owner or Admin)
router.post('/distribute/:assetId', protect, async (req, res) => {
  try {
    const { amount, source } = req.body;
    const assetId = req.params.assetId;

    // Find asset
    const asset = await Asset.findById(assetId);
    if (!asset) {
      return sendError(res, 'Asset not found', 404);
    }

    // Check ownership
    if (asset.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to distribute royalties for this asset', 403);
    }

    if (!amount || amount <= 0) {
      return sendError(res, 'Invalid royalty amount', 400);
    }

    // Get all investments for this asset
    const investments = await Investment.find({ asset: assetId, status: 'active' })
      .populate('investor', 'email firstName walletAddress');

    if (investments.length === 0) {
      return sendError(res, 'No active investments found for this asset', 400);
    }

    // Calculate total shares owned by all investors
    const totalInvestedShares = investments.reduce((sum, inv) => sum + inv.sharesOwned, 0);
    
    if (totalInvestedShares === 0) {
      return sendError(res, 'No shares to distribute royalties to', 400);
    }

    // Distribute royalties proportionally
    const royaltyDistributions = [];
    
    for (const investment of investments) {
      const sharePercentage = investment.sharesOwned / totalInvestedShares;
      const royaltyAmount = amount * sharePercentage;
      
      // Update investment earnings
      investment.earnings.totalRoyalties += royaltyAmount;
      investment.earnings.lastRoyaltyPayment = new Date();
      investment.calculateROI();
      await investment.save();
      
      // Create transaction record
      const transaction = await Transaction.create({
        user: investment.investor._id,
        asset: assetId,
        investment: investment._id,
        type: 'royalty_payment',
        amount: royaltyAmount,
        currency: 'USD',
        status: 'completed',
        details: {
          description: `Royalty payment from ${asset.title}`,
          source: source || 'Asset usage'
        }
      });
      
      royaltyDistributions.push({
        investor: investment.investor,
        investment: investment._id,
        shares: investment.sharesOwned,
        sharePercentage,
        royaltyAmount,
        transaction: transaction._id
      });
      
      // Send email notification
      try {
        await sendEmail({
          email: investment.investor.email,
          ...emailTemplates.royaltyPayment({
            amount: royaltyAmount.toFixed(2),
            assetTitle: asset.title,
            date: new Date().toLocaleDateString()
          })
        });
      } catch (emailError) {
        logger.error('Failed to send royalty payment email:', emailError);
      }
      
      // Emit real-time notification
      if (global.io) {
        global.io.to(`user-${investment.investor._id}`).emit('royalty-received', {
          amount: royaltyAmount,
          assetTitle: asset.title,
          investment: investment._id
        });
      }
    }
    
    // Update asset financial data
    asset.financials.totalRoyaltiesPaid += amount;
    asset.financials.lastRoyaltyPayment = new Date();
    await asset.save();
    
    // Distribute on blockchain if applicable
    if (asset.blockchain.isOnChain) {
      try {
        await distributeRoyalties(asset.blockchain.tokenId, amount);
        logger.info(`Royalties distributed on blockchain for asset ${assetId}`);
      } catch (blockchainError) {
        logger.error('Blockchain royalty distribution failed:', blockchainError);
      }
    }

    sendSuccess(res, {
      totalAmount: amount,
      distributions: royaltyDistributions.length,
      details: royaltyDistributions
    }, 'Royalties distributed successfully');
  } catch (error) {
    logger.error('Distribute royalties error:', error);
    sendError(res, 'Failed to distribute royalties', 500);
  }
});

// @desc    Get royalty payments for user
// @route   GET /api/royalties/payments
// @access  Private
router.get('/payments', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const royaltyPayments = await Transaction.find({
      user: req.user._id,
      type: 'royalty_payment'
    })
      .populate('asset', 'title type images')
      .populate('investment', 'sharesOwned')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments({
      user: req.user._id,
      type: 'royalty_payment'
    });

    // Calculate total royalties received
    const totalRoyalties = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'royalty_payment'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = totalRoyalties[0] || { total: 0, count: 0 };

    sendPaginated(res, {
      payments: royaltyPayments,
      summary
    }, page, limit, total, 'Royalty payments retrieved successfully');
  } catch (error) {
    logger.error('Get royalty payments error:', error);
    sendError(res, 'Failed to retrieve royalty payments', 500);
  }
});

// @desc    Get royalty statistics
// @route   GET /api/royalties/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    // Monthly royalty earnings
    const monthlyRoyalties = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'royalty_payment'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Royalties by asset type
    const royaltiesByType = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'royalty_payment'
        }
      },
      {
        $lookup: {
          from: 'assets',
          localField: 'asset',
          foreignField: '_id',
          as: 'assetInfo'
        }
      },
      { $unwind: '$assetInfo' },
      {
        $group: {
          _id: '$assetInfo.type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    sendSuccess(res, {
      monthly: monthlyRoyalties,
      byType: royaltiesByType
    }, 'Royalty statistics retrieved successfully');
  } catch (error) {
    logger.error('Get royalty stats error:', error);
    sendError(res, 'Failed to retrieve royalty statistics', 500);
  }
});

export default router;