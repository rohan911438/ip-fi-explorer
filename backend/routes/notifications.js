import express from 'express';
import { protect } from '../middleware/auth.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// In-memory notification storage (in production, use a database)
const notifications = [];
let notificationId = 1;

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const userNotifications = notifications
      .filter(n => n.userId.toString() === req.user._id.toString())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + limit);
    
    const total = notifications.filter(n => n.userId.toString() === req.user._id.toString()).length;
    
    sendPaginated(res, userNotifications, page, limit, total, 'Notifications retrieved successfully');
  } catch (error) {
    logger.error('Get notifications error:', error);
    sendError(res, 'Failed to retrieve notifications', 500);
  }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = notifications.find(
      n => n.id === parseInt(req.params.id) && n.userId.toString() === req.user._id.toString()
    );
    
    if (!notification) {
      return sendError(res, 'Notification not found', 404);
    }
    
    notification.isRead = true;
    notification.readAt = new Date();
    
    sendSuccess(res, notification, 'Notification marked as read');
  } catch (error) {
    logger.error('Mark notification read error:', error);
    sendError(res, 'Failed to mark notification as read', 500);
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', protect, async (req, res) => {
  try {
    const userNotifications = notifications.filter(
      n => n.userId.toString() === req.user._id.toString() && !n.isRead
    );
    
    userNotifications.forEach(notification => {
      notification.isRead = true;
      notification.readAt = new Date();
    });
    
    sendSuccess(res, { marked: userNotifications.length }, 'All notifications marked as read');
  } catch (error) {
    logger.error('Mark all notifications read error:', error);
    sendError(res, 'Failed to mark all notifications as read', 500);
  }
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
  try {
    const unreadCount = notifications.filter(
      n => n.userId.toString() === req.user._id.toString() && !n.isRead
    ).length;
    
    sendSuccess(res, { count: unreadCount }, 'Unread count retrieved successfully');
  } catch (error) {
    logger.error('Get unread count error:', error);
    sendError(res, 'Failed to retrieve unread count', 500);
  }
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const notificationIndex = notifications.findIndex(
      n => n.id === parseInt(req.params.id) && n.userId.toString() === req.user._id.toString()
    );
    
    if (notificationIndex === -1) {
      return sendError(res, 'Notification not found', 404);
    }
    
    notifications.splice(notificationIndex, 1);
    
    sendSuccess(res, null, 'Notification deleted successfully');
  } catch (error) {
    logger.error('Delete notification error:', error);
    sendError(res, 'Failed to delete notification', 500);
  }
});

// Helper function to create notifications (used by other parts of the app)
export const createNotification = (userId, type, title, message, data = {}) => {
  const notification = {
    id: notificationId++,
    userId,
    type,
    title,
    message,
    data,
    isRead: false,
    createdAt: new Date(),
    readAt: null
  };
  
  notifications.push(notification);
  
  // Emit real-time notification
  if (global.io) {
    global.io.to(`user-${userId}`).emit('new-notification', notification);
  }
  
  return notification;
};

export default router;