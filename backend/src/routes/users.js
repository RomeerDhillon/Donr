/**
 * Users Routes
 * Handles user profile and registration endpoints
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { db } = require('../config/firebase');
const admin = require('firebase-admin');

/**
 * Get current user profile
 * GET /users/me
 */
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    // Check if db is available
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Database not initialized',
      });
    }

    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      console.warn(`⚠️ User document not found for UID: ${req.user.uid}`);
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const userData = userDoc.data();
    console.log(`✅ Retrieved user data for ${req.user.uid}:`, {
      name: userData.name,
      role: userData.role,
      email: userData.email,
    });

    res.json({
      success: true,
      data: {
        id: userDoc.id,
        ...userData,
      },
    });
  } catch (error) {
    console.error('❌ Error in GET /users/me:', error);
    next(error);
  }
});

/**
 * Update user profile
 * PUT /users/me
 */
router.put('/me', verifyToken, async (req, res, next) => {
  try {
    // Check if db is available
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Database not initialized',
      });
    }

    const { name, location, fcmToken } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (location) updates.location = location;
    if (fcmToken) updates.fcmToken = fcmToken;

    updates.updatedAt = admin.firestore.Timestamp.now();

    await db.collection('users').doc(req.user.uid).update(updates);

    const updatedDoc = await db.collection('users').doc(req.user.uid).get();

    console.log(`✅ Updated user profile for ${req.user.uid}`);

    res.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
    });
  } catch (error) {
    console.error('❌ Error in PUT /users/me:', error);
    next(error);
  }
});

/**
 * Create user profile (called after Firebase Auth registration)
 * POST /users
 */
router.post('/', verifyToken, async (req, res, next) => {
  try {
    // Check if db is available
    if (!db) {
      console.error('❌ Database not initialized');
      return res.status(500).json({
        success: false,
        error: 'Database not initialized',
      });
    }

    // Log the full request
    console.log('📥 POST /users request received:');
    console.log('   User UID:', req.user.uid);
    console.log('   User Email:', req.user.email);
    console.log('   Request Body:', JSON.stringify(req.body, null, 2));

    const { name, role, location, fcmToken } = req.body;

    console.log('📝 Creating user profile:', {
      uid: req.user.uid,
      email: req.user.email,
      name: name,
      role: role,
      hasName: !!name,
      hasRole: !!role,
    });

    // Validate required fields
    if (!name || !role) {
      console.error('❌ Missing required fields:', { name: !!name, role: !!role });
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, role',
      });
    }

    // Validate role
    if (!['donator', 'distributor', 'acceptor'].includes(role)) {
      console.error('❌ Invalid role:', role);
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be: donator, distributor, or acceptor',
      });
    }

    // Check if user already exists
    const existingUser = await db.collection('users').doc(req.user.uid).get();
    if (existingUser.exists) {
      console.warn('⚠️ User profile already exists for UID:', req.user.uid);
      return res.status(400).json({
        success: false,
        error: 'User profile already exists',
      });
    }

    // Prepare user data
    const userData = {
      name: name.trim(),
      email: req.user.email,
      role: role,
      location: location || null,
      fcmToken: fcmToken || null,
      createdAt: admin.firestore.Timestamp.now(),
    };

    console.log('💾 Saving user data to Firestore:', userData);

    // Save to Firestore
    await db.collection('users').doc(req.user.uid).set(userData);

    // Verify the data was saved
    const savedUser = await db.collection('users').doc(req.user.uid).get();
    if (!savedUser.exists) {
      console.error('❌ User document was not created in Firestore!');
      return res.status(500).json({
        success: false,
        error: 'Failed to create user profile',
      });
    }

    const savedData = savedUser.data();
    
    // Convert Firestore Timestamp to serializable format for response
    const responseData = {
      id: req.user.uid,
      name: savedData.name,
      email: savedData.email,
      role: savedData.role,
      location: savedData.location || null,
      fcmToken: savedData.fcmToken || null,
      createdAt: savedData.createdAt ? savedData.createdAt.toDate().toISOString() : new Date().toISOString(),
    };

    console.log('✅ User profile created successfully:', {
      id: responseData.id,
      name: responseData.name,
      role: responseData.role,
      email: responseData.email,
      createdAt: responseData.createdAt,
    });

    res.status(201).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('❌ Error in POST /users:', error);
    next(error);
  }
});

module.exports = router;

