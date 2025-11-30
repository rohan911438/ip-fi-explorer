import { body, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
export const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('Last name is required and must be less than 50 characters'),
  handleValidationErrors
];

// User login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Asset creation validation
export const validateAsset = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .trim()
    .withMessage('Title is required and must be less than 200 characters'),
  body('description')
    .isLength({ min: 10, max: 2000 })
    .trim()
    .withMessage('Description must be between 10 and 2000 characters'),
  body('type')
    .isIn(['digital_art', 'patent', 'music', 'character_ip', 'trademark', 'copyright', 'trade_secret'])
    .withMessage('Invalid asset type'),
  body('category')
    .notEmpty()
    .trim()
    .withMessage('Category is required'),
  body('ownership.totalShares')
    .isInt({ min: 1 })
    .withMessage('Total shares must be at least 1'),
  body('ownership.sharePrice')
    .isFloat({ min: 0.01 })
    .withMessage('Share price must be at least $0.01'),
  body('financials.totalValue')
    .isFloat({ min: 1 })
    .withMessage('Total value must be at least $1'),
  handleValidationErrors
];

// Investment validation
export const validateInvestment = [
  body('assetId')
    .isMongoId()
    .withMessage('Invalid asset ID'),
  body('shares')
    .isInt({ min: 1 })
    .withMessage('Must purchase at least 1 share'),
  body('paymentMethod')
    .isIn(['crypto', 'credit_card', 'bank_transfer'])
    .withMessage('Invalid payment method'),
  handleValidationErrors
];

// Wallet address validation
export const validateWalletAddress = [
  body('walletAddress')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid Ethereum wallet address'),
  handleValidationErrors
];

// Update profile validation
export const validateProfileUpdate = [
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('First name must be less than 50 characters'),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('Last name must be less than 50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .trim()
    .withMessage('Bio must be less than 500 characters'),
  handleValidationErrors
];