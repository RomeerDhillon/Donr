/**
 * Firebase Admin SDK Configuration
 * Initializes Firebase Admin for server-side operations
 */

const admin = require('firebase-admin');
require('dotenv').config();

let firebaseApp;

let db, auth;

try {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (!projectId || !privateKey || !clientEmail) {
      console.warn('⚠️  Firebase Admin credentials not found in .env file.');
      console.warn('   Backend will run but Firebase features (auth, database) will not work.');
      console.warn('   To enable Firebase: Get service account key from Firebase Console > Project Settings > Service Accounts');
      console.warn('   Then add to .env: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
      firebaseApp = null;
      db = null;
      auth = null;
    } else {
      const serviceAccount = {
        projectId,
        privateKey,
        clientEmail,
      };

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      db = admin.firestore();
      auth = admin.auth();
      console.log('✅ Firebase Admin initialized successfully');
    }
  } else {
    firebaseApp = admin.app();
    db = admin.firestore();
    auth = admin.auth();
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error.message);
  console.warn('⚠️  Continuing without Firebase. Backend will run but Firebase features will not work.');
  firebaseApp = null;
  db = null;
  auth = null;
}

module.exports = { admin, db, auth, firebaseApp };

