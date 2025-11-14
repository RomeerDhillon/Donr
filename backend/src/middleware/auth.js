/**
 * Authentication Middleware
 * Verifies Firebase ID tokens and attaches user info to request
 */

const { admin } = require('../config/firebase');

/**
 * Middleware to verify Firebase ID token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyToken = async (req, res, next) => {
  try {
    // Check if admin.auth is available
    if (!admin || !admin.auth) {
      console.error('❌ Firebase Admin auth not initialized');
      return res.status(500).json({
        success: false,
        error: 'Authentication service not available',
      });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ No authorization token provided');
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided',
      });
    }

    const token = authHeader.split('Bearer ')[1];

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    console.log('✅ Token verified for user:', {
      uid: req.user.uid,
      email: req.user.email,
    });

    next();
  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

/**
 * Middleware to check user role
 * @param {Array<string>} allowedRoles - Array of allowed roles
 */
const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { db } = require('../config/firebase');
      const userDoc = await db.collection('users').doc(req.user.uid).get();

      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      const userData = userDoc.data();
      const userRole = userData.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        });
      }

      req.user.role = userRole;
      req.user.userData = userData;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error checking user role',
      });
    }
  };
};

module.exports = { verifyToken, checkRole };

