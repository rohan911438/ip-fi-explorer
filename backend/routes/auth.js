import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { validateRegistration, validateLogin, validateWalletAddress } from '../middleware/validation.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sendEmail, emailTemplates } from '../utils/email.js';
import { verifyWalletSignature } from '../services/blockchain.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { email, username, password, firstName, lastName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return sendError(res, 'User already exists with this email or username', 400);
    }

    // Create user
    const user = await User.create({
      email,
      username,
      password,
      firstName,
      lastName
    });

    // Generate token
    const token = user.getSignedJwtToken();

    // Send welcome email
    try {
      await sendEmail({
        email: user.email,
        ...emailTemplates.welcome(user.firstName)
      });
    } catch (emailError) {
      logger.error('Failed to send welcome email:', emailError);
    }

    // Remove password from response
    user.password = undefined;

    sendSuccess(res, { user, token }, 'User registered successfully', 201);
  } catch (error) {
    logger.error('Registration error:', error);
    sendError(res, 'Registration failed', 500);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = user.getSignedJwtToken();

    // Remove password from response
    user.password = undefined;

    sendSuccess(res, { user, token }, 'Login successful');
  } catch (error) {
    logger.error('Login error:', error);
    sendError(res, 'Login failed', 500);
  }
});

// @desc    Connect wallet
// @route   POST /api/auth/connect-wallet
// @access  Private
router.post('/connect-wallet', protect, validateWalletAddress, async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;

    // Verify signature
    const isValidSignature = verifyWalletSignature(message, signature, walletAddress);
    if (!isValidSignature) {
      return sendError(res, 'Invalid wallet signature', 400);
    }

    // Check if wallet is already connected to another account
    const existingUser = await User.findOne({ 
      walletAddress, 
      _id: { $ne: req.user._id } 
    });

    if (existingUser) {
      return sendError(res, 'Wallet is already connected to another account', 400);
    }

    // Update user with wallet address
    req.user.walletAddress = walletAddress;
    await req.user.save();

    sendSuccess(res, { walletAddress }, 'Wallet connected successfully');
  } catch (error) {
    logger.error('Wallet connection error:', error);
    sendError(res, 'Failed to connect wallet', 500);
  }
});

// @desc    Disconnect wallet
// @route   DELETE /api/auth/disconnect-wallet
// @access  Private
router.delete('/disconnect-wallet', protect, async (req, res) => {
  try {
    req.user.walletAddress = undefined;
    await req.user.save();

    sendSuccess(res, null, 'Wallet disconnected successfully');
  } catch (error) {
    logger.error('Wallet disconnection error:', error);
    sendError(res, 'Failed to disconnect wallet', 500);
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    sendSuccess(res, req.user, 'User retrieved successfully');
  } catch (error) {
    logger.error('Get user error:', error);
    sendError(res, 'Failed to retrieve user', 500);
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    // In a production app, you might want to blacklist the token
    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    logger.error('Logout error:', error);
    sendError(res, 'Logout failed', 500);
  }
});

export default router;