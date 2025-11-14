/**
 * Notification Service
 * Handles Firebase Cloud Messaging (FCM) push notifications
 */

const { admin, db } = require('../config/firebase');

/**
 * Send FCM notification to a user
 * @param {string} userId - User ID (Firebase UID)
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data payload
 * @returns {Promise<string>} Message ID
 */
const sendNotificationToUser = async (userId, title, body, data = {}) => {
  try {
    // Get user's FCM token from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;

    if (!fcmToken) {
      console.warn(`No FCM token found for user ${userId}`);
      return null;
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK', // For React Native compatibility
      },
      token: fcmToken,
    };

    const response = await admin.messaging().send(message);
    console.log(`✅ Notification sent to ${userId}: ${response}`);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

/**
 * Send notification to multiple users
 * @param {Array<string>} userIds - Array of user IDs
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data payload
 */
const sendNotificationToMultipleUsers = async (userIds, title, body, data = {}) => {
  try {
    const promises = userIds.map((userId) =>
      sendNotificationToUser(userId, title, body, data).catch((err) => {
        console.error(`Failed to send notification to ${userId}:`, err);
        return null;
      })
    );

    await Promise.all(promises);
    console.log(`✅ Notifications sent to ${userIds.length} users`);
  } catch (error) {
    console.error('Error sending batch notifications:', error);
    throw error;
  }
};

/**
 * Notify distributors about a new donation
 * @param {Array<string>} distributorIds - Array of distributor user IDs
 * @param {string} donationId - Donation ID
 * @param {string} foodType - Type of food
 */
const notifyDistributorsAboutDonation = async (distributorIds, donationId, foodType) => {
  const title = 'New Food Donation Available';
  const body = `A new ${foodType} donation is available nearby!`;
  const data = {
    type: 'new_donation',
    donationId,
    foodType,
  };

  await sendNotificationToMultipleUsers(distributorIds, title, body, data);
};

/**
 * Notify acceptor about new available food
 * @param {string} acceptorId - Acceptor user ID
 * @param {string} distributorId - Distributor ID
 * @param {string} foodType - Type of food
 */
const notifyAcceptorAboutFood = async (acceptorId, distributorId, foodType) => {
  const title = 'Food Available Near You';
  const body = `${foodType} is now available at a nearby distribution center!`;
  const data = {
    type: 'food_available',
    distributorId,
    foodType,
  };

  await sendNotificationToUser(acceptorId, title, body, data);
};

/**
 * Notify donator about successful distribution
 * @param {string} donatorId - Donator user ID
 * @param {string} donationId - Donation ID
 */
const notifyDonatorAboutDistribution = async (donatorId, donationId) => {
  const title = 'Food Successfully Distributed';
  const body = 'Your donation has been successfully distributed to those in need!';
  const data = {
    type: 'donation_distributed',
    donationId,
  };

  await sendNotificationToUser(donatorId, title, body, data);
};

module.exports = {
  sendNotificationToUser,
  sendNotificationToMultipleUsers,
  notifyDistributorsAboutDonation,
  notifyAcceptorAboutFood,
  notifyDonatorAboutDistribution,
};

