import express from 'express';
import User from '../models/User.js';
import Investment from '../models/Investment.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateProfileUpdate } from '../middleware/validation.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
import { upload, uploadToCloudinary } from '../utils/upload.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    sendSuccess(res, user, 'Profile retrieved successfully');
  } catch (error) {
    logger.error('Get profile error:', error);
    sendError(res, 'Failed to retrieve profile', 500);
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, validateProfileUpdate, async (req, res) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'bio', 'preferences'];
    const updateData = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    logger.error('Update profile error:', error);
    sendError(res, 'Failed to update profile', 500);
  }
});

// @desc    Upload profile image
// @route   POST /api/users/profile/image
// @access  Private
router.post('/profile/image', protect, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'No image file provided', 400);
    }

    // Upload to cloudinary
    const result = await uploadToCloudinary(req.file, 'profiles');
    
    // Update user profile
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: result.url },
      { new: true }
    );

    sendSuccess(res, { profileImage: result.url }, 'Profile image updated successfully');
  } catch (error) {
    logger.error('Upload profile image error:', error);
    sendError(res, 'Failed to upload profile image', 500);
  }
});

// @desc    Get user portfolio
// @route   GET /api/users/portfolio
// @access  Private
router.get('/portfolio', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const investments = await Investment.find({ investor: req.user._id })
      .populate('asset', 'title type images ownership financials')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Investment.countDocuments({ investor: req.user._id });

    // Calculate portfolio statistics
    const stats = await Investment.aggregate([
      { $match: { investor: req.user._id } },
      {
        $group: {
          _id: null,
          totalInvested: { $sum: '$totalInvestment' },
          totalCurrentValue: { $sum: '$currentValue' },
          totalRoyalties: { $sum: '$earnings.totalRoyalties' },
          totalInvestments: { $sum: 1 }
        }
      }
    ]);

    const portfolioStats = stats[0] || {
      totalInvested: 0,
      totalCurrentValue: 0,
      totalRoyalties: 0,
      totalInvestments: 0
    };

    sendPaginated(res, { investments, stats: portfolioStats }, page, limit, total, 'Portfolio retrieved successfully');
  } catch (error) {
    logger.error('Get portfolio error:', error);
    sendError(res, 'Failed to retrieve portfolio', 500);
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get investment statistics
    const investmentStats = await Investment.aggregate([
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

    // Get asset type distribution
    const assetTypeDistribution = await Investment.aggregate([
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
          totalInvested: { $sum: '$totalInvestment' }
        }
      }
    ]);

    const stats = {
      investment: investmentStats[0] || {
        totalInvested: 0,
        totalCurrentValue: 0,
        totalRoyalties: 0,
        totalInvestments: 0,
        avgROI: 0
      },
      assetTypes: assetTypeDistribution
    };

    sendSuccess(res, stats, 'User statistics retrieved successfully');
  } catch (error) {
    logger.error('Get user stats error:', error);
    sendError(res, 'Failed to retrieve user statistics', 500);
  }
});

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({});

    sendPaginated(res, users, page, limit, total, 'Users retrieved successfully');
  } catch (error) {
    logger.error('Get users error:', error);
    sendError(res, 'Failed to retrieve users', 500);
  }
});

export default router;