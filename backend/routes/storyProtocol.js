import express from 'express';
import storyProtocolService from '../services/storyProtocol.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Initialize Story Protocol service on first request
let serviceInitialized = false;

const ensureServiceInitialized = async (req, res, next) => {
  if (!serviceInitialized) {
    try {
      await storyProtocolService.initialize();
      serviceInitialized = true;
    } catch (error) {
      logger.error('Failed to initialize Story Protocol service:', error);
      return res.status(500).json({
        success: false,
        message: 'Story Protocol service unavailable',
        error: error.message
      });
    }
  }
  next();
};

// Get Story Protocol network information
router.get('/network-info', ensureServiceInitialized, async (req, res) => {
  try {
    const networkInfo = await storyProtocolService.getNetworkInfo();
    res.json(networkInfo);
  } catch (error) {
    logger.error('Network info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get network information',
      error: error.message
    });
  }
});

// Register an IP asset on Story Protocol
router.post('/register-ip', protect, ensureServiceInitialized, async (req, res) => {
  try {
    const { tokenContract, tokenId } = req.body;
    
    if (!tokenContract || !tokenId) {
      return res.status(400).json({
        success: false,
        message: 'Token contract and token ID are required'
      });
    }

    const result = await storyProtocolService.registerIPAsset(tokenContract, tokenId);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'IP asset registered successfully',
        data: {
          transactionHash: result.transactionHash,
          ipId: result.ipId
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to register IP asset',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Register IP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Check if an IP asset is registered
router.get('/check-ip/:chainId/:tokenContract/:tokenId', optionalAuth, ensureServiceInitialized, async (req, res) => {
  try {
    const { chainId, tokenContract, tokenId } = req.params;
    
    const result = await storyProtocolService.isIPRegistered(
      parseInt(chainId),
      tokenContract,
      parseInt(tokenId)
    );
    
    res.json(result);
  } catch (error) {
    logger.error('Check IP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check IP registration',
      error: error.message
    });
  }
});

// Attach license terms to an IP asset
router.post('/attach-license', protect, ensureServiceInitialized, async (req, res) => {
  try {
    const { ipId, licenseData } = req.body;
    
    if (!ipId || !licenseData) {
      return res.status(400).json({
        success: false,
        message: 'IP ID and license data are required'
      });
    }

    const result = await storyProtocolService.attachLicenseTerms(ipId, licenseData);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'License terms attached successfully',
        data: {
          transactionHash: result.transactionHash
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to attach license terms',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Attach license error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Mint license tokens for an IP asset
router.post('/mint-license-tokens', protect, ensureServiceInitialized, async (req, res) => {
  try {
    const { ipId, amount, receiver, licenseData } = req.body;
    
    if (!ipId || !amount || !receiver) {
      return res.status(400).json({
        success: false,
        message: 'IP ID, amount, and receiver are required'
      });
    }

    const result = await storyProtocolService.mintLicenseTokens(
      ipId,
      amount,
      receiver,
      licenseData || '0x'
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: 'License tokens minted successfully',
        data: {
          transactionHash: result.transactionHash
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to mint license tokens',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Mint license tokens error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Pay royalties for an IP asset
router.post('/pay-royalties', protect, ensureServiceInitialized, async (req, res) => {
  try {
    const { receiverIpId, payerIpId, token, amount } = req.body;
    
    if (!receiverIpId || !payerIpId || !token || !amount) {
      return res.status(400).json({
        success: false,
        message: 'All royalty payment parameters are required'
      });
    }

    const result = await storyProtocolService.payRoyalties(
      receiverIpId,
      payerIpId,
      token,
      amount
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Royalties paid successfully',
        data: {
          transactionHash: result.transactionHash
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to pay royalties',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Pay royalties error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get claimable revenue for an IP asset
router.get('/claimable-revenue/:ipId/:asset/:user', protect, ensureServiceInitialized, async (req, res) => {
  try {
    const { ipId, asset, user } = req.params;
    
    const result = await storyProtocolService.getClaimableRevenue(ipId, asset, user);
    
    res.json(result);
  } catch (error) {
    logger.error('Get claimable revenue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get claimable revenue',
      error: error.message
    });
  }
});

// Get Story Protocol contract addresses
router.get('/contracts', optionalAuth, (req, res) => {
  try {
    const contracts = {
      IPAssetRegistry: process.env.STORY_IP_ASSET_REGISTRY,
      LicensingModule: process.env.STORY_LICENSING_MODULE,
      RoyaltyModule: process.env.STORY_ROYALTY_MODULE,
      LicenseRegistry: process.env.STORY_LICENSE_REGISTRY,
      LicenseToken: process.env.STORY_LICENSE_TOKEN,
      PILicenseTemplate: process.env.STORY_PIL_LICENSE_TEMPLATE,
      GroupingModule: process.env.STORY_GROUPING_MODULE,
      DisputeModule: process.env.STORY_DISPUTE_MODULE,
      CoreMetadataModule: process.env.STORY_CORE_METADATA_MODULE
    };

    res.json({
      success: true,
      contracts,
      network: {
        name: 'Story Testnet',
        chainId: process.env.DEPLOYMENT_CHAIN_ID || '1513',
        rpc: process.env.STORY_TESTNET_RPC
      }
    });
  } catch (error) {
    logger.error('Get contracts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contract information',
      error: error.message
    });
  }
});

export default router;