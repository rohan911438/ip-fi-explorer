import mongoose from 'mongoose';
import User from '../models/User.js';
import Asset from '../models/Asset.js';
import Investment from '../models/Investment.js';
import Transaction from '../models/Transaction.js';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Sample data
const sampleUsers = [
  {
    email: 'admin@ipfi.com',
    username: 'admin',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isVerified: true,
    walletAddress: '0x742d35Cc643C0532EAae9b1734c28f60f85940d1'
  },
  {
    email: 'creator@ipfi.com',
    username: 'creator1',
    password: 'creator123',
    firstName: 'John',
    lastName: 'Creator',
    role: 'creator',
    isVerified: true,
    walletAddress: '0x8ba1f109551bD432803012645Hac136c9561009d'
  },
  {
    email: 'investor@ipfi.com',
    username: 'investor1',
    password: 'investor123',
    firstName: 'Jane',
    lastName: 'Investor',
    role: 'user',
    isVerified: true,
    totalInvested: 5000,
    walletAddress: '0x3ba1f109551bD432803012645Hac136c9561009e'
  }
];

const sampleAssets = [
  {
    title: 'Digital Art Masterpiece #001',
    description: 'A stunning digital art piece created using advanced AI techniques and traditional artistic principles.',
    type: 'digital_art',
    category: 'Digital Art',
    subcategory: 'AI Generated',
    images: [{
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
      alt: 'Digital Art Masterpiece #001',
      isPrimary: true
    }],
    ownership: {
      totalShares: 1000,
      availableShares: 750,
      sharePrice: 25,
      currency: 'USD'
    },
    financials: {
      totalValue: 25000,
      minimumInvestment: 25,
      expectedROI: 15.5,
      royaltyRate: 10
    },
    tags: ['digital art', 'ai', 'modern', 'collectible'],
    status: 'live',
    featured: true,
    trending: true
  },
  {
    title: 'Revolutionary AI Patent Portfolio',
    description: 'A comprehensive patent portfolio covering breakthrough artificial intelligence algorithms and implementations.',
    type: 'patent',
    category: 'Technology',
    subcategory: 'Artificial Intelligence',
    images: [{
      url: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=500',
      alt: 'AI Patent Portfolio',
      isPrimary: true
    }],
    ownership: {
      totalShares: 5000,
      availableShares: 3200,
      sharePrice: 50,
      currency: 'USD'
    },
    financials: {
      totalValue: 250000,
      minimumInvestment: 50,
      expectedROI: 22.3,
      royaltyRate: 15
    },
    tags: ['patent', 'ai', 'technology', 'innovation'],
    status: 'live',
    featured: true
  },
  {
    title: 'Grammy Winner Music Rights',
    description: 'Exclusive rights to a Grammy-winning song with consistent streaming revenue and performance royalties.',
    type: 'music',
    category: 'Music',
    subcategory: 'Pop',
    images: [{
      url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500',
      alt: 'Grammy Winner Music Rights',
      isPrimary: true
    }],
    ownership: {
      totalShares: 2000,
      availableShares: 800,
      sharePrice: 75,
      currency: 'USD'
    },
    financials: {
      totalValue: 150000,
      minimumInvestment: 75,
      expectedROI: 18.7,
      royaltyRate: 12,
      totalRoyaltiesPaid: 15000
    },
    tags: ['music', 'grammy', 'royalties', 'streaming'],
    status: 'live',
    trending: true\n  }\n];\n\nconst seedDatabase = async () => {\n  try {\n    // Connect to database\n    await mongoose.connect(process.env.MONGODB_URI);\n    logger.info('Connected to MongoDB');\n\n    // Clear existing data\n    await Promise.all([\n      User.deleteMany({}),\n      Asset.deleteMany({}),\n      Investment.deleteMany({}),\n      Transaction.deleteMany({})\n    ]);\n    logger.info('Cleared existing data');\n\n    // Create users\n    const createdUsers = [];\n    for (const userData of sampleUsers) {\n      const user = await User.create(userData);\n      createdUsers.push(user);\n      logger.info(`Created user: ${user.username}`);\n    }\n\n    // Create assets\n    const createdAssets = [];\n    for (let i = 0; i < sampleAssets.length; i++) {\n      const assetData = {\n        ...sampleAssets[i],\n        creator: createdUsers[1]._id // Assign to creator user\n      };\n      const asset = await Asset.create(assetData);\n      createdAssets.push(asset);\n      logger.info(`Created asset: ${asset.title}`);\n    }\n\n    // Create sample investments\n    const sampleInvestments = [\n      {\n        investor: createdUsers[2]._id, // investor1\n        asset: createdAssets[0]._id,\n        sharesOwned: 100,\n        purchasePrice: 25,\n        totalInvestment: 2500,\n        currentValue: 2650,\n        earnings: {\n          totalRoyalties: 150,\n          lastRoyaltyPayment: new Date()\n        },\n        roi: 8.0\n      },\n      {\n        investor: createdUsers[2]._id, // investor1\n        asset: createdAssets[1]._id,\n        sharesOwned: 50,\n        purchasePrice: 50,\n        totalInvestment: 2500,\n        currentValue: 2750,\n        earnings: {\n          totalRoyalties: 275,\n          lastRoyaltyPayment: new Date()\n        },\n        roi: 11.0\n      }\n    ];\n\n    for (const investmentData of sampleInvestments) {\n      const investment = await Investment.create(investmentData);\n      logger.info(`Created investment: ${investment._id}`);\n      \n      // Create corresponding transaction\n      await Transaction.create({\n        user: investment.investor,\n        asset: investment.asset,\n        investment: investment._id,\n        type: 'purchase',\n        amount: investment.totalInvestment,\n        currency: 'USD',\n        status: 'completed',\n        details: {\n          sharesTransferred: investment.sharesOwned,\n          pricePerShare: investment.purchasePrice,\n          description: `Purchase of ${investment.sharesOwned} shares`\n        },\n        fees: {\n          platformFee: investment.totalInvestment * 0.025,\n          totalFees: investment.totalInvestment * 0.025\n        }\n      });\n    }\n\n    // Create sample royalty transactions\n    const royaltyTransactions = [\n      {\n        user: createdUsers[2]._id,\n        asset: createdAssets[0]._id,\n        type: 'royalty_payment',\n        amount: 150,\n        currency: 'USD',\n        status: 'completed',\n        details: {\n          description: 'Monthly royalty payment',\n          source: 'Digital art licensing'\n        }\n      },\n      {\n        user: createdUsers[2]._id,\n        asset: createdAssets[1]._id,\n        type: 'royalty_payment',\n        amount: 275,\n        currency: 'USD',\n        status: 'completed',\n        details: {\n          description: 'Quarterly royalty payment',\n          source: 'Patent licensing revenue'\n        }\n      }\n    ];\n\n    for (const txData of royaltyTransactions) {\n      const transaction = await Transaction.create(txData);\n      logger.info(`Created royalty transaction: ${transaction._id}`);\n    }\n\n    logger.info('✅ Database seeded successfully!');\n    logger.info('Test accounts created:');\n    logger.info('Admin: admin@ipfi.com / admin123');\n    logger.info('Creator: creator@ipfi.com / creator123');\n    logger.info('Investor: investor@ipfi.com / investor123');\n    \n    process.exit(0);\n  } catch (error) {\n    logger.error('Database seeding failed:', error);\n    process.exit(1);\n  }\n};\n\nseedDatabase();