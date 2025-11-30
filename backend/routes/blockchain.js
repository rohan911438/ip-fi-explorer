import express from 'express';
import { protect } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { 
  getCurrentGasPrice, 
  getTokenBalance, 
  verifyWalletSignature,
  getETHtoUSD 
} from '../services/blockchain.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @desc    Get current gas prices
// @route   GET /api/blockchain/gas-price
// @access  Public
router.get('/gas-price', async (req, res) => {
  try {
    const gasPrice = await getCurrentGasPrice();
    sendSuccess(res, gasPrice, 'Gas price retrieved successfully');
  } catch (error) {
    logger.error('Get gas price error:', error);
    sendError(res, 'Failed to retrieve gas price', 500);
  }
});

// @desc    Verify wallet signature
// @route   POST /api/blockchain/verify-signature
// @access  Public
router.post('/verify-signature', async (req, res) => {
  try {
    const { message, signature, walletAddress } = req.body;
    
    if (!message || !signature || !walletAddress) {
      return sendError(res, 'Missing required fields', 400);
    }
    
    const isValid = verifyWalletSignature(message, signature, walletAddress);
    
    sendSuccess(res, { isValid }, isValid ? 'Signature verified' : 'Invalid signature');
  } catch (error) {
    logger.error('Verify signature error:', error);
    sendError(res, 'Failed to verify signature', 500);
  }
});

// @desc    Get token balance for user's investments
// @route   GET /api/blockchain/token-balance/:tokenId
// @access  Private
router.get('/token-balance/:tokenId', protect, async (req, res) => {
  try {
    if (!req.user.walletAddress) {
      return sendError(res, 'Wallet not connected', 400);
    }
    
    const tokenInfo = await getTokenBalance(req.user.walletAddress, req.params.tokenId);
    sendSuccess(res, tokenInfo, 'Token balance retrieved successfully');
  } catch (error) {
    logger.error('Get token balance error:', error);
    sendError(res, 'Failed to retrieve token balance', 500);
  }
});

// @desc    Get ETH to USD conversion rate
// @route   GET /api/blockchain/eth-price
// @access  Public
router.get('/eth-price', async (req, res) => {
  try {
    const ethPrice = await getETHtoUSD();
    sendSuccess(res, { price: ethPrice, currency: 'USD' }, 'ETH price retrieved successfully');
  } catch (error) {
    logger.error('Get ETH price error:', error);
    sendError(res, 'Failed to retrieve ETH price', 500);
  }
});

// @desc    Get blockchain network status
// @route   GET /api/blockchain/network-status
// @access  Public
router.get('/network-status', async (req, res) => {
  try {
    // This would normally check blockchain network health
    // For now, we'll return a mock status
    const networkStatus = {
      isOnline: true,
      blockNumber: Math.floor(Math.random() * 1000000) + 18500000,
      gasPrice: '20 gwei',
      chainId: 1,
      networkName: 'Ethereum Mainnet'
    };
    
    sendSuccess(res, networkStatus, 'Network status retrieved successfully');
  } catch (error) {
    logger.error('Get network status error:', error);
    sendError(res, 'Failed to retrieve network status', 500);
  }
});

export default router;