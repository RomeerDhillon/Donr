/**
 * Notifications Routes
 * Defines all notification-related API endpoints
 */

const express = require('express');
const router = express.Router();
const { sendNotification } = require('../controllers/notificationsController');
const { verifyToken } = require('../middleware/auth');

// Send notification (Admin/authenticated users)
router.post('/send', verifyToken, sendNotification);

module.exports = router;

