# Donr Setup Guide

Complete setup instructions for the Donr application.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Google Cloud account (for Maps API)
- Expo CLI (`npm install -g expo-cli`)

## Step 1: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
4. Create Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Set security rules (see below)
5. Get Firebase Web Config:
   - Go to Project Settings > General
   - Scroll to "Your apps" and add a web app
   - Copy the config values

6. Get Firebase Admin SDK:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely

## Step 2: Google Maps API Setup (OPTIONAL)

**Note:** The app works without Google Maps API! It uses:
- **Native maps** (Apple Maps on iOS, default maps on Android) - No API key needed
- **OpenStreetMap Nominatim** for geocoding - Free, no API key needed

If you want to use Google Maps instead, follow these steps:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Geocoding API (optional, app uses OpenStreetMap by default)
4. Create API Key:
   - Go to APIs & Services > Credentials
   - Create API Key
   - Restrict key to your app's bundle ID

## Step 3: Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure `.env`:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
GOOGLE_MAPS_API_KEY=your-google-maps-api-key  # Optional: Only if you want Google Maps instead of native maps
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:19006
```

5. Start the server:
```bash
npm run dev
```

## Step 4: Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure `.env` with your Firebase config:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key  # Optional: Only if you want Google Maps instead of native maps
```

5. Start Expo:
```bash
npm start
```

6. Scan QR code with Expo Go app or press:
   - `i` for iOS simulator
   - `a` for Android emulator
   - `w` for web

## Step 5: Firestore Security Rules

Add these rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Donations collection
    match /donations/{donationId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.donatorId == request.auth.uid || 
         resource.data.distributorId == request.auth.uid);
    }
  }
}
```

## Step 6: Testing

1. Start backend server (port 3000)
2. Start frontend Expo server
3. Register a new account with one of the roles:
   - Donator
   - Distributor
   - Acceptor
4. Test the features:
   - Create donations (Donator)
   - View nearby donations (Distributor/Acceptor)
   - Claim donations (Distributor)
   - View map (All roles)

## Troubleshooting

### Backend Issues

- **Firebase Admin Error**: Check that your private key is properly formatted with `\n` characters
- **Port Already in Use**: Change PORT in `.env` or kill the process using port 3000
- **CORS Errors**: Ensure FRONTEND_URL matches your Expo URL

### Frontend Issues

- **Firebase Config Error**: Verify all EXPO_PUBLIC_* variables are set
- **Maps Not Loading**: Check Google Maps API key and ensure APIs are enabled
- **Location Permission**: Grant location permissions in device settings

### Common Errors

- **"User not found"**: User profile not created in Firestore after registration
- **"Invalid token"**: Firebase token expired, try logging out and back in
- **"Location permission denied"**: Enable location permissions in app settings

## Next Steps

- Set up Firebase Cloud Messaging for push notifications
- Configure production environment variables
- Set up CI/CD pipeline
- Add unit and integration tests
- Deploy backend to cloud (Heroku, AWS, etc.)
- Build and publish mobile apps to App Store/Play Store

