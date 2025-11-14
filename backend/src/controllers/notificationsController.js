/**
 * Notifications Controller
 * Handles notification-related API operations
 */

const { sendNotificationToUser, sendNotificationToMultipleUsers } = require('../services/notifications');

/**
 * Send a notification to a user
 * POST /notifications/send
 */
const sendNotification = async (req, res, next) => {
  try {
    const { userId, title, body, data } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, title, body',
      });
    }

    const messageId = await sendNotificationToUser(userId, title, body, data || {});

    res.json({
      success: true,
      data: {
        messageId,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendNotification,
};

