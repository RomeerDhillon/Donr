/**
 * Requests Routes
 * Handles food request endpoints
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { db } = require('../config/firebase');
const admin = require('firebase-admin');

/**
 * Get all requests (Distributor/Acceptor)
 * GET /requests
 */
router.get('/', verifyToken, async (req, res, next) => {
  try {
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Database not initialized',
      });
    }

    const requestsSnapshot = await db.collection('requests').get();
    const requests = [];

    requestsSnapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error('❌ Error in GET /requests:', error);
    next(error);
  }
});

/**
 * Create a new food request (Acceptor/Seeker)
 * POST /requests
 */
router.post('/', verifyToken, async (req, res, next) => {
  try {
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Database not initialized',
      });
    }

    const { foodType, urgency, lat, lng, address } = req.body;

    if (!foodType || !lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: foodType, lat, lng',
      });
    }

    const requestData = {
      userId: req.user.uid,
      foodType,
      urgency: urgency || 'normal',
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      address: address || null,
      status: 'pending',
      createdAt: admin.firestore.Timestamp.now(),
    };

    const docRef = await db.collection('requests').add(requestData);

    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...requestData,
      },
    });
  } catch (error) {
    console.error('❌ Error in POST /requests:', error);
    next(error);
  }
});

/**
 * Update request status (Distributor)
 * PUT /requests/:id/status
 */
router.put('/:id/status', verifyToken, async (req, res, next) => {
  try {
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Database not initialized',
      });
    }

    const { status } = req.body;
    const { id } = req.params;

    if (!['pending', 'accepted', 'fulfilled', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
      });
    }

    await db.collection('requests').doc(id).update({
      status,
      updatedAt: admin.firestore.Timestamp.now(),
    });

    const updatedDoc = await db.collection('requests').doc(id).get();

    res.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
    });
  } catch (error) {
    console.error('❌ Error in PUT /requests/:id/status:', error);
    next(error);
  }
});

module.exports = router;

