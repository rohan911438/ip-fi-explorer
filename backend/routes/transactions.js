import express from 'express';
import Transaction from '../models/Transaction.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @desc    Get user transactions
// @route   GET /api/transactions
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = { user: req.user._id };
    
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const transactions = await Transaction.find(query)
      .populate('asset', 'title type images')
      .populate('investment', 'sharesOwned')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(query);

    sendPaginated(res, transactions, page, limit, total, 'Transactions retrieved successfully');
  } catch (error) {
    logger.error('Get transactions error:', error);
    sendError(res, 'Failed to retrieve transactions', 500);
  }
});

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate('asset', 'title type images')
      .populate('investment', 'sharesOwned currentValue');

    if (!transaction) {
      return sendError(res, 'Transaction not found', 404);
    }

    sendSuccess(res, transaction, 'Transaction retrieved successfully');
  } catch (error) {
    logger.error('Get transaction error:', error);
    sendError(res, 'Failed to retrieve transaction', 500);
  }
});

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    // Monthly transaction volume
    const monthlyStats = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          volume: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    sendSuccess(res, { typeStats: stats, monthlyStats }, 'Transaction statistics retrieved successfully');
  } catch (error) {
    logger.error('Get transaction stats error:', error);
    sendError(res, 'Failed to retrieve transaction statistics', 500);
  }
});

// @desc    Get all transactions (admin only)
// @route   GET /api/transactions/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({})
      .populate('user', 'username email firstName lastName')
      .populate('asset', 'title type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments({});

    sendPaginated(res, transactions, page, limit, total, 'All transactions retrieved successfully');
  } catch (error) {
    logger.error('Get all transactions error:', error);
    sendError(res, 'Failed to retrieve all transactions', 500);
  }
});

export default router;