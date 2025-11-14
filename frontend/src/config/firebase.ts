/**
 * Firebase Configuration
 * Initializes Firebase for React Native
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyB7CWTuyAElihbVXGrLsnWruY1f00AgUkM",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "donr-6be07.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "donr-6be07",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "donr-6be07.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "740946392650",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:740946392650:web:3b9ba5585203348880d8b3",
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  console.log('Firebase: Initializing...');
  if (!getApps().length) {
    console.log('Firebase: Creating new app instance');
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase: Initialized successfully');
  } else {
    console.log('Firebase: Using existing app instance');
    app = getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Re-throw to be caught by error boundary
  throw error;
}

export { app, auth, db };

