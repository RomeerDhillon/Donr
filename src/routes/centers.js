/**
 * Centers Routes
 * Handles food centers/pantries endpoints
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { db } = require('../config/firebase');
const admin = require('firebase-admin');

/**
 * Get all centers
 * GET /centers
 */
router.get('/', verifyToken, async (req, res, next) => {
  try {
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Database not initialized',
      });
    }

    const centersSnapshot = await db.collection('centers').get();
    const centers = [];

    centersSnapshot.forEach((doc) => {
      centers.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json({
      success: true,
      data: centers,
    });
  } catch (error) {
    console.error('❌ Error in GET /centers:', error);
    next(error);
  }
});

/**
 * Create a new center (Admin/Distributor)
 * POST /centers
 */
router.post('/', verifyToken, async (req, res, next) => {
  try {
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Database not initialized',
      });
    }

    const { name, address, lat, lng, hours, centerType, phone, capacity } = req.body;

    if (!name || !address || !lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, address, lat, lng',
      });
    }

    const centerData = {
      name,
      address,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      hours: hours || null,
      centerType: centerType || 'food bank',
      phone: phone || null,
      capacity: capacity || null,
      createdAt: admin.firestore.Timestamp.now(),
    };

    const docRef = await db.collection('centers').add(centerData);

    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...centerData,
      },
    });
  } catch (error) {
    console.error('❌ Error in POST /centers:', error);
    next(error);
  }
});

module.exports = router;

