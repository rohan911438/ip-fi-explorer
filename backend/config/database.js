import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    // Check if MongoDB URI is configured properly
    if (!mongoUri || mongoUri === 'mongodb://localhost:27017/ipfi-platform') {
      logger.warn('⚠️ MongoDB not configured or not running locally');
      logger.info('💡 Quick setup options:');
      logger.info('   1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
      logger.info('   2. Use MongoDB Atlas (free): https://cloud.mongodb.com/');
      logger.info('   3. Update MONGODB_URI in .env with your database connection string');
      logger.warn('🚫 Server running in limited mode without database');
      return;
    }
    
    const conn = await mongoose.connect(mongoUri, {
      // Remove deprecated options that are no longer needed in Mongoose 6+
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

  } catch (error) {
    logger.error('Database connection failed:', error);
    logger.warn('⚠️ Server running in limited mode - database features disabled');
    // Don't exit process - allow server to run for API testing
  }
};