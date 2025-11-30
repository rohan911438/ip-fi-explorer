import express from 'express';
import Asset from '../models/Asset.js';
import Investment from '../models/Investment.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @desc    Get platform overview statistics
// @route   GET /api/analytics/overview
// @access  Public
router.get('/overview', optionalAuth, async (req, res) => {
  try {
    // Basic platform statistics
    const stats = await Promise.all([
      Asset.countDocuments({ status: 'live' }),
      Investment.countDocuments({}),
      User.countDocuments({ isActive: true }),
      Transaction.aggregate([
        { $match: { type: 'purchase' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { type: 'royalty_payment' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const [totalAssets, totalInvestments, totalUsers, volumeResult, royaltiesResult] = stats;

    // Asset type distribution
    const assetsByType = await Asset.aggregate([
      { $match: { status: 'live' } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalValue: { $sum: '$financials.totalValue' }
        }
      }
    ]);

    // Top performing assets
    const topAssets = await Asset.find({ status: 'live' })
      .select('title type metrics financials')
      .sort({ 'metrics.totalInvested': -1 })
      .limit(5);

    const overview = {
      totalAssets,
      totalInvestments,
      totalUsers,
      totalVolume: volumeResult[0]?.total || 0,
      totalRoyalties: royaltiesResult[0]?.total || 0,
      assetsByType,
      topAssets
    };

    sendSuccess(res, overview, 'Platform overview retrieved successfully');
  } catch (error) {
    logger.error('Get overview error:', error);
    sendError(res, 'Failed to retrieve platform overview', 500);
  }
});

// @desc    Get market trends
// @route   GET /api/analytics/trends
// @access  Public
router.get('/trends', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Daily investment volume
    const dailyVolume = await Transaction.aggregate([
      {
        $match: {
          type: 'purchase',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          volume: { $sum: '$amount' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Asset performance trends
    const assetTrends = await Asset.aggregate([
      { $match: { status: 'live' } },
      {
        $project: {
          title: 1,
          type: 1,
          'metrics.totalInvested': 1,
          'metrics.views': 1,
          'financials.totalRoyaltiesPaid': 1,
          fundingPercentage: {
            $multiply: [
              {
                $divide: [
                  { $subtract: ['$ownership.totalShares', '$ownership.availableShares'] },
                  '$ownership.totalShares'
                ]
              },
              100
            ]
          }
        }
      },
      { $sort: { fundingPercentage: -1 } },
      { $limit: 10 }
    ]);

    // Category growth
    const categoryGrowth = await Asset.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalInvested: { $sum: '$metrics.totalInvested' },
          avgFunding: {
            $avg: {
              $multiply: [
                {
                  $divide: [
                    { $subtract: ['$ownership.totalShares', '$ownership.availableShares'] },
                    '$ownership.totalShares'
                  ]
                },
                100
              ]
            }
          }
        }
      },
      { $sort: { totalInvested: -1 } }
    ]);

    sendSuccess(res, {
      dailyVolume,
      assetTrends,
      categoryGrowth
    }, 'Market trends retrieved successfully');
  } catch (error) {
    logger.error('Get trends error:', error);
    sendError(res, 'Failed to retrieve market trends', 500);
  }
});

// @desc    Get user analytics dashboard
// @route   GET /api/analytics/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Portfolio overview
    const portfolioStats = await Investment.aggregate([
      { $match: { investor: userId } },
      {
        $group: {
          _id: null,
          totalInvested: { $sum: '$totalInvestment' },
          totalCurrentValue: { $sum: '$currentValue' },
          totalRoyalties: { $sum: '$earnings.totalRoyalties' },
          totalInvestments: { $sum: 1 },
          avgROI: { $avg: '$roi' }
        }
      }
    ]);

    // Investment performance over time
    const performanceHistory = await Investment.aggregate([
      { $match: { investor: userId } },
      {
        $group: {
          _id: {
            year: { $year: '$purchaseDate' },
            month: { $month: '$purchaseDate' }
          },
          invested: { $sum: '$totalInvestment' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Asset type distribution
    const assetDistribution = await Investment.aggregate([
      { $match: { investor: userId } },
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
          count: { $sum: 1 },
          invested: { $sum: '$totalInvestment' },
          currentValue: { $sum: '$currentValue' },
          royalties: { $sum: '$earnings.totalRoyalties' }
        }
      }
    ]);

    // Recent activity
    const recentTransactions = await Transaction.find({ user: userId })
      .populate('asset', 'title type')
      .sort({ createdAt: -1 })
      .limit(10);

    const dashboard = {
      portfolio: portfolioStats[0] || {
        totalInvested: 0,
        totalCurrentValue: 0,
        totalRoyalties: 0,
        totalInvestments: 0,
        avgROI: 0
      },
      performanceHistory,
      assetDistribution,
      recentTransactions
    };

    sendSuccess(res, dashboard, 'User dashboard analytics retrieved successfully');
  } catch (error) {
    logger.error('Get dashboard analytics error:', error);
    sendError(res, 'Failed to retrieve dashboard analytics', 500);
  }
});

// @desc    Get admin analytics
// @route   GET /api/analytics/admin
// @access  Private/Admin
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    // Platform metrics
    const platformMetrics = await Promise.all([
      User.countDocuments({}),
      Asset.countDocuments({}),
      Investment.countDocuments({}),
      Transaction.countDocuments({})
    ]);

    // Revenue analytics
    const revenueStats = await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalFees: { $sum: '$fees.totalFees' }
        }
      }
    ]);

    // User growth over time
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // Asset approval queue
    const pendingAssets = await Asset.countDocuments({ status: 'pending_review' });

    // Top users by investment
    const topInvestors = await User.aggregate([
      {
        $lookup: {
          from: 'investments',
          localField: '_id',
          foreignField: 'investor',
          as: 'investments'
        }
      },
      {
        $addFields: {
          totalInvested: { $sum: '$investments.totalInvestment' },
          investmentCount: { $size: '$investments' }
        }
      },
      { $sort: { totalInvested: -1 } },
      { $limit: 10 },
      {
        $project: {
          username: 1,
          firstName: 1,
          lastName: 1,
          totalInvested: 1,
          investmentCount: 1
        }
      }
    ]);

    const adminAnalytics = {
      metrics: {
        totalUsers: platformMetrics[0],
        totalAssets: platformMetrics[1],
        totalInvestments: platformMetrics[2],
        totalTransactions: platformMetrics[3],
        pendingAssets
      },
      revenue: revenueStats,
      userGrowth,
      topInvestors
    };

    sendSuccess(res, adminAnalytics, 'Admin analytics retrieved successfully');
  } catch (error) {
    logger.error('Get admin analytics error:', error);
    sendError(res, 'Failed to retrieve admin analytics', 500);
  }
});

export default router;