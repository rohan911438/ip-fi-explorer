import express from 'express';
import Asset from '../models/Asset.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { validateAsset } from '../middleware/validation.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
import { upload, uploadMultipleToCloudinary } from '../utils/upload.js';
import { mintIPToken } from '../services/blockchain.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @desc    Get all assets
// @route   GET /api/assets
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    let query = { status: 'live', isActive: true };
    
    // Filters
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    if (req.query.category) {
      query.category = new RegExp(req.query.category, 'i');
    }
    
    if (req.query.search) {
      query.$or = [
        { title: new RegExp(req.query.search, 'i') },
        { description: new RegExp(req.query.search, 'i') },
        { tags: new RegExp(req.query.search, 'i') }
      ];
    }
    
    if (req.query.minPrice || req.query.maxPrice) {
      query['ownership.sharePrice'] = {};
      if (req.query.minPrice) {
        query['ownership.sharePrice'].$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query['ownership.sharePrice'].$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Sorting
    let sort = {};
    switch (req.query.sort) {
      case 'price-low':
        sort = { 'ownership.sharePrice': 1 };
        break;
      case 'price-high':
        sort = { 'ownership.sharePrice': -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'popular':
        sort = { 'metrics.views': -1 };
        break;
      default:
        sort = { featured: -1, trending: -1, createdAt: -1 };
    }

    const assets = await Asset.find(query)
      .populate('creator', 'username firstName lastName profileImage')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Asset.countDocuments(query);

    sendPaginated(res, assets, page, limit, total, 'Assets retrieved successfully');
  } catch (error) {
    logger.error('Get assets error:', error);
    sendError(res, 'Failed to retrieve assets', 500);
  }
});

// @desc    Get single asset
// @route   GET /api/assets/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('creator', 'username firstName lastName profileImage walletAddress');

    if (!asset) {
      return sendError(res, 'Asset not found', 404);
    }

    // Increment view count if not the creator
    if (!req.user || req.user._id.toString() !== asset.creator._id.toString()) {
      asset.metrics.views += 1;
      await asset.save();
    }

    sendSuccess(res, asset, 'Asset retrieved successfully');
  } catch (error) {
    logger.error('Get asset error:', error);
    sendError(res, 'Failed to retrieve asset', 500);
  }
});

// @desc    Create new asset
// @route   POST /api/assets
// @access  Private
router.post('/', protect, upload.array('files', 10), validateAsset, async (req, res) => {
  try {
    const assetData = {
      ...req.body,
      creator: req.user._id
    };

    // Parse JSON fields
    if (req.body.ownership) {
      assetData.ownership = JSON.parse(req.body.ownership);
    }
    if (req.body.financials) {
      assetData.financials = JSON.parse(req.body.financials);
    }
    if (req.body.licensing) {
      assetData.licensing = JSON.parse(req.body.licensing);
    }

    // Set available shares to total shares initially
    assetData.ownership.availableShares = assetData.ownership.totalShares;

    // Upload files if provided
    if (req.files && req.files.length > 0) {
      const uploadedFiles = await uploadMultipleToCloudinary(req.files, 'assets');
      
      assetData.images = uploadedFiles
        .filter(file => file.format.match(/^(jpg|jpeg|png|gif)$/i))
        .map((file, index) => ({
          url: file.url,
          alt: `${assetData.title} - Image ${index + 1}`,
          isPrimary: index === 0
        }));
      
      assetData.files = uploadedFiles
        .filter(file => !file.format.match(/^(jpg|jpeg|png|gif)$/i))
        .map(file => ({
          url: file.url,
          name: `Document ${uploadedFiles.indexOf(file) + 1}`,
          type: file.format,
          size: file.size
        }));
    }

    // Create asset
    const asset = await Asset.create(assetData);
    
    // Populate creator info
    await asset.populate('creator', 'username firstName lastName profileImage');

    // Mint on blockchain if wallet is connected
    if (req.user.walletAddress && process.env.STORY_PROTOCOL_CONTRACT_ADDRESS) {
      try {
        const blockchainResult = await mintIPToken({
          title: asset.title,
          description: asset.description,
          primaryImage: asset.images[0]?.url,
          type: asset.type,
          creator: asset.creator.username,
          creatorWallet: req.user.walletAddress,
          totalShares: asset.ownership.totalShares
        });

        // Update asset with blockchain info
        asset.blockchain = {
          contractAddress: process.env.STORY_PROTOCOL_CONTRACT_ADDRESS,
          tokenId: blockchainResult.tokenId,
          transactionHash: blockchainResult.transactionHash,
          isOnChain: true
        };
        
        await asset.save();
      } catch (blockchainError) {
        logger.error('Blockchain minting failed:', blockchainError);
        // Continue without blockchain integration
      }
    }

    sendSuccess(res, asset, 'Asset created successfully', 201);
  } catch (error) {
    logger.error('Create asset error:', error);
    sendError(res, 'Failed to create asset', 500);
  }
});

// @desc    Update asset
// @route   PUT /api/assets/:id
// @access  Private (Creator or Admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return sendError(res, 'Asset not found', 404);
    }

    // Check ownership
    if (asset.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to update this asset', 403);
    }

    // Fields that can be updated
    const allowedFields = [
      'title', 'description', 'category', 'subcategory', 'tags',
      'licensing', 'financials'
    ];
    
    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    const updatedAsset = await Asset.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('creator', 'username firstName lastName profileImage');

    sendSuccess(res, updatedAsset, 'Asset updated successfully');
  } catch (error) {
    logger.error('Update asset error:', error);
    sendError(res, 'Failed to update asset', 500);
  }
});

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private (Creator or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return sendError(res, 'Asset not found', 404);
    }

    // Check ownership
    if (asset.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to delete this asset', 403);
    }

    // Check if asset has investments
    const Investment = (await import('../models/Investment.js')).default;
    const hasInvestments = await Investment.findOne({ asset: req.params.id });
    
    if (hasInvestments) {
      return sendError(res, 'Cannot delete asset with existing investments', 400);
    }

    await asset.deleteOne();

    sendSuccess(res, null, 'Asset deleted successfully');
  } catch (error) {
    logger.error('Delete asset error:', error);
    sendError(res, 'Failed to delete asset', 500);
  }
});

// @desc    Get user's created assets
// @route   GET /api/assets/user/created
// @access  Private
router.get('/user/created', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const assets = await Asset.find({ creator: req.user._id })
      .populate('creator', 'username firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Asset.countDocuments({ creator: req.user._id });

    sendPaginated(res, assets, page, limit, total, 'Created assets retrieved successfully');
  } catch (error) {
    logger.error('Get created assets error:', error);
    sendError(res, 'Failed to retrieve created assets', 500);
  }
});

export default router;