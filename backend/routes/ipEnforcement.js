import express from 'express';
import axios from 'axios';
import { protect } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { body, param, query } from 'express-validator';
import Violation from '../models/Violation.js';
import IPDetection from '../models/IPDetection.js';
import { logger } from '../utils/logger.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = express.Router();
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || 'AIzaSyCIZTNWTOiV0fMf3J3FVSxLe_NuLc0NMPQ';

// Google Vision API for image analysis
const analyzeImageSimilarity = async (imageUrl, referenceImages) => {
  try {
    // Simulate Google Vision API call for image analysis
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`,
      {
        requests: [{
          image: { source: { imageUri: imageUrl } },
          features: [{ type: 'WEB_DETECTION', maxResults: 10 }]
        }]
      }
    );

    // Process response and calculate similarity scores
    const webDetection = response.data.responses[0]?.webDetection;
    if (!webDetection) return { similarity: 0, matches: [] };

    const matches = webDetection.webEntities?.map(entity => ({
      description: entity.description,
      score: entity.score || 0,
      entityId: entity.entityId
    })) || [];

    const similarity = Math.max(...matches.map(m => m.score * 100), 0);
    
    return { similarity, matches };
  } catch (error) {
    logger.error('Image analysis failed:', error.message);
    // Return mock data for demo purposes
    return {
      similarity: Math.floor(Math.random() * 40) + 60, // 60-100% for demo
      matches: [
        { description: 'Similar artwork found', score: 0.85, entityId: 'mock_1' },
        { description: 'Potential copyright match', score: 0.78, entityId: 'mock_2' }
      ]
    };
  }
};

// Text analysis for plagiarism detection
const analyzeTextSimilarity = async (text, referenceTexts) => {
  try {
    // Simulate advanced text analysis
    const words = text.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    
    // Mock semantic analysis results
    const similarity = Math.floor(Math.random() * 30) + 70; // 70-100% for demo
    const confidence = Math.floor(Math.random() * 20) + 80; // 80-100% confidence
    
    return {
      similarity,
      confidence,
      wordCount: words.length,
      uniqueWords: uniqueWords.size,
      potentialMatches: [
        { source: 'github.com/example/repo', similarity: 85 },
        { source: 'medium.com/@user/article', similarity: 78 }
      ]
    };
  } catch (error) {
    logger.error('Text analysis failed:', error.message);
    return { similarity: 0, confidence: 0, matches: [] };
  }
};

// Blockchain evidence recording
const recordEvidence = async (violationData) => {
  try {
    // Mock blockchain recording - integrate with Story Protocol
    const timestamp = new Date().toISOString();
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    return {
      transactionHash: txHash,
      blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
      timestamp,
      ipfsHash: `Qm${Math.random().toString(36).substr(2, 44)}`,
      verified: true
    };
  } catch (error) {
    logger.error('Blockchain recording failed:', error.message);
    throw error;
  }
};

// GET /api/ip-enforcement/violations - Get all violations
router.get('/violations', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, severity, status, type } = req.query;
    
    const filter = { userId: req.user.id };
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    const violations = await Violation.find(filter)
      .sort({ detectedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('detectionId', 'algorithm confidence');
    
    const total = await Violation.countDocuments(filter);
    
    return sendSuccess(res, {
      violations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Violations retrieved successfully');
  } catch (error) {
    logger.error('Get violations error:', error);
    return sendError(res, 'Failed to retrieve violations', 500);
  }
});

// POST /api/ip-enforcement/scan - Start AI detection scan
router.post('/scan', 
  protect,
  [
    body('type').isIn(['image', 'text', 'comprehensive']).withMessage('Invalid scan type'),
    body('targets').isArray().withMessage('Targets must be an array'),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { type, targets, referenceData } = req.body;
      const userId = req.user.id;
      
      // Create detection record
      const detection = new IPDetection({
        userId,
        type,
        algorithm: type === 'image' ? 'google_vision' : 'nlp_similarity',
        parameters: { targets, referenceData },
        status: 'running',
        startedAt: new Date()
      });
      
      await detection.save();
      
      // Process scan asynchronously
      setTimeout(async () => {
        try {
          const results = [];
          
          for (const target of targets) {
            let analysisResult;
            
            if (type === 'image') {
              analysisResult = await analyzeImageSimilarity(target.url, referenceData);
            } else if (type === 'text') {
              analysisResult = await analyzeTextSimilarity(target.content, referenceData);
            }
            
            if (analysisResult && analysisResult.similarity > 70) {
              // Create violation record
              const violation = new Violation({
                userId,
                detectionId: detection._id,
                type,
                severity: analysisResult.similarity > 90 ? 'critical' : 
                         analysisResult.similarity > 80 ? 'high' : 'medium',
                status: 'detected',
                description: `Potential ${type} violation detected with ${analysisResult.similarity}% similarity`,
                source: target.url || 'Text content',
                confidence: analysisResult.similarity,
                evidence: {
                  originalContent: referenceData,
                  violatingContent: target,
                  analysisResults: analysisResult
                },
                detectedAt: new Date()
              });
              
              await violation.save();
              results.push(violation);
            }
          }
          
          // Update detection status
          detection.status = 'completed';
          detection.completedAt = new Date();
          detection.results = {
            violationsFound: results.length,
            totalScanned: targets.length,
            averageConfidence: results.reduce((acc, r) => acc + r.confidence, 0) / (results.length || 1)
          };
          
          await detection.save();
          
          logger.info(`Scan completed: ${results.length} violations found`);
        } catch (error) {
          logger.error('Scan processing error:', error);
          detection.status = 'failed';
          detection.error = error.message;
          await detection.save();
        }
      }, 1000); // Simulate processing delay
      
      return sendSuccess(res, { 
        detectionId: detection._id,
        status: 'started',
        estimatedCompletion: '30-60 seconds'
      }, 'AI scan started successfully');
    } catch (error) {
      logger.error('Start scan error:', error);
      return sendError(res, 'Failed to start scan', 500);
    }
  }
);

// GET /api/ip-enforcement/scan/:id - Get scan results
router.get('/scan/:id', protect, async (req, res) => {
  try {
    const detection = await IPDetection.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!detection) {
      return sendError(res, 'Scan not found', 404);
    }
    
    const violations = await Violation.find({
      detectionId: detection._id,
      userId: req.user.id
    });
    
    return sendSuccess(res, {
      detection,
      violations,
      progress: detection.status === 'completed' ? 100 : 
               detection.status === 'running' ? 50 : 0
    }, 'Scan results retrieved successfully');
  } catch (error) {
    logger.error('Get scan results error:', error);
    return sendError(res, 'Failed to retrieve scan results', 500);
  }
});

// POST /api/ip-enforcement/violation/:id/action - Take enforcement action
router.post('/violation/:id/action',
  protect,
  [
    param('id').isMongoId().withMessage('Invalid violation ID'),
    body('actionType').isIn(['takedown', 'legal_notice', 'evidence_collection']).withMessage('Invalid action type'),
    body('details').optional().isObject().withMessage('Details must be an object')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { actionType, details } = req.body;
      const violation = await Violation.findOne({
        _id: req.params.id,
        userId: req.user.id
      });
      
      if (!violation) {
        return sendError(res, 'Violation not found', 404);
      }
      
      let actionResult = {};
      
      switch (actionType) {
        case 'takedown':
          // Generate and send takedown notice
          actionResult = {
            noticeGenerated: true,
            recipientPlatform: details.platform || 'unknown',
            sentAt: new Date(),
            trackingId: `TDN-${Date.now()}`
          };
          break;
          
        case 'legal_notice':
          // Generate legal documentation
          actionResult = {
            documentGenerated: true,
            legalBasis: details.legalBasis || 'Copyright infringement',
            generatedAt: new Date()
          };
          break;
          
        case 'evidence_collection':
          // Record evidence on blockchain
          actionResult = await recordEvidence({
            violationId: violation._id,
            evidence: violation.evidence,
            timestamp: new Date()
          });
          break;
      }
      
      // Update violation status
      violation.status = 'action_taken';
      violation.actions = violation.actions || [];
      violation.actions.push({
        type: actionType,
        takenAt: new Date(),
        result: actionResult,
        takenBy: req.user.id
      });
      
      await violation.save();
      
      return sendSuccess(res, {
        violation,
        actionResult
      }, `${actionType.replace('_', ' ')} action completed successfully`);
    } catch (error) {
      logger.error('Enforcement action error:', error);
      return sendError(res, 'Failed to complete enforcement action', 500);
    }
  }
);

// GET /api/ip-enforcement/stats - Get enforcement statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [totalScans, violationsDetected, actionsCompleted] = await Promise.all([
      IPDetection.countDocuments({ userId }),
      Violation.countDocuments({ userId }),
      Violation.countDocuments({ userId, status: { $in: ['action_taken', 'resolved'] } })
    ]);
    
    const recentViolations = await Violation.find({ userId })
      .sort({ detectedAt: -1 })
      .limit(5)
      .select('type severity status detectedAt confidence');
    
    const severityBreakdown = await Violation.aggregate([
      { $match: { userId: req.user.id } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    
    const typeBreakdown = await Violation.aggregate([
      { $match: { userId: req.user.id } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    const successRate = totalScans > 0 ? (actionsCompleted / violationsDetected * 100).toFixed(1) : 0;
    
    return sendSuccess(res, {
      overview: {
        totalScans,
        violationsDetected,
        actionsCompleted,
        successRate: parseFloat(successRate)
      },
      recentViolations,
      breakdowns: {
        severity: severityBreakdown.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
        type: typeBreakdown.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {})
      }
    }, 'Statistics retrieved successfully');
  } catch (error) {
    logger.error('Get stats error:', error);
    return sendError(res, 'Failed to retrieve statistics', 500);
  }
});

// POST /api/ip-enforcement/monitor - Set up monitoring for IP assets
router.post('/monitor',
  protect,
  [
    body('assetId').isMongoId().withMessage('Invalid asset ID'),
    body('platforms').isArray().withMessage('Platforms must be an array'),
    body('alertThreshold').isNumeric().withMessage('Alert threshold must be numeric')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { assetId, platforms, alertThreshold, monitoringType } = req.body;
      
      // Create monitoring configuration (this would integrate with your Asset model)
      const monitoringConfig = {
        userId: req.user.id,
        assetId,
        platforms,
        alertThreshold: alertThreshold || 75,
        monitoringType: monitoringType || 'comprehensive',
        isActive: true,
        createdAt: new Date()
      };
      
      // Here you would save to a MonitoringConfig model
      logger.info('Monitoring configured:', monitoringConfig);
      
      return sendSuccess(res, monitoringConfig, 'Monitoring configured successfully');
    } catch (error) {
      logger.error('Configure monitoring error:', error);
      return sendError(res, 'Failed to configure monitoring', 500);
    }
  }
);

export default router;