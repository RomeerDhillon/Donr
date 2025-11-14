import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyB7CWTuyAElihbVXGrLsnWruY1f00AgUkM",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "donr-6be07.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "donr-6be07",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "donr-6be07.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "740946392650",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:740946392650:web:3b9ba5585203348880d8b3",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// NOTE: IndexedDB persistence is DISABLED to prevent Firestore internal assertion errors
// This is a known issue with Firebase Firestore when persistence is enabled
// The app will still work normally, just without offline caching
// Real-time updates via onSnapshot will still work perfectly
console.log('✅ Firestore initialized (persistence disabled for stability)');

