# Donr - Food Waste Reduction Platform

Donr is a cross-platform web application designed to reduce food waste and hunger by connecting food donators, distributors (shelters/pantries), and acceptors (people in need).

## 🏗️ Project Structure

```
Donr/
├── backend/          # Node.js/Express API server
│   ├── src/
│   │   ├── config/   # Firebase configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth, error handling
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── server.js    # Entry point
│   └── package.json
│
└── frontend/         # React web application
    ├── src/
    │   ├── pages/     # Page components
    │   ├── components/  # Reusable components
    │   ├── contexts/   # React contexts (UserContext)
    │   ├── config/      # Firebase, API config
    │   └── App.js       # Main app component
    ├── public/        # Static files
    └── package.json
```

## 🚀 Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the `backend` directory:
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001

# Firebase Admin SDK (Optional - backend runs without it but Firebase features won't work)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-client-email
```

4. Start the server:
```bash
npm start
```

The API will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3001` and automatically open in your browser.

## 🔑 API Keys & Configuration

### Required
- **Firebase**: Required for authentication and database
  - Get your config from Firebase Console > Project Settings > General > Your apps
  - Frontend uses Firebase Web SDK config
  - Backend uses Firebase Admin SDK service account key (optional - app runs without it but Firebase features won't work)

### Optional
- **Google Maps API**: NOT REQUIRED!
  - The app uses **Leaflet + OpenStreetMap** - completely free, no API key needed
  - No billing setup required
  - All map features work out of the box

## 📱 Features

- ✅ Firebase Authentication
- ✅ Real-time Firestore database with `onSnapshot` listeners
- ✅ Role-based access (Donator/Distributor/Acceptor)
- ✅ Interactive map with Leaflet + OpenStreetMap (FREE, no API key)
- ✅ Real-time marker updates from Firestore
- ✅ Role-based marker filtering
- ✅ Distance filtering
- ✅ Address geocoding (OpenStreetMap Nominatim - free)
- ✅ Donation creation and management
- ✅ Food requests creation
- ✅ Food centers management
- ✅ Matching algorithm for nearby distributors
- ✅ Universal header navigation
- ✅ Responsive, modern UI
- ✅ Works out of the box - minimal configuration needed

## 🗺️ Maps & Geocoding

The app uses **100% FREE, no-API-key-required** solutions:

- **Maps**: Leaflet + OpenStreetMap
  - Completely free and open-source
  - No API key required
  - No billing setup needed
  - Interactive maps with custom markers
  - Real-time updates
  
- **Geocoding**: OpenStreetMap Nominatim
  - Free, no API key required
  - Converts addresses to coordinates and vice versa
  - Rate limits are generous for normal usage

- **Directions**: OpenStreetMap routing
  - "Get Directions" opens OpenStreetMap with routing
  - Works on all devices

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- Firebase Admin SDK (optional)
- Firebase Firestore
- OpenStreetMap Nominatim (geocoding)
- CORS enabled for frontend

**Frontend:**
- React 18
- React Router DOM
- Firebase SDK (Auth + Firestore)
- Leaflet + React-Leaflet (maps)
- OpenStreetMap (tile provider)
- Axios (API client)
- Webpack (bundler)
- Babel (transpiler)

## 📝 API Endpoints

### Authentication (via Firebase)
- Users authenticate using Firebase Auth
- Backend verifies Firebase ID tokens

### User Endpoints
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `POST /api/users` - Create user profile (with role)

### Donation Endpoints
- `GET /api/donations` - Get all donations (authenticated users)
- `POST /api/donations` - Create donation (Donator only)
- `PUT /api/donations/:id/claim` - Claim donation (Distributor only)
- `PUT /api/donations/:id/distribute` - Mark as distributed (Distributor only)

### Centers Endpoints
- `GET /api/centers` - Get all food centers
- `POST /api/centers` - Create food center (authenticated users)

### Requests Endpoints
- `GET /api/requests` - Get all food requests (Distributor/Acceptor)
- `POST /api/requests` - Create food request (Acceptor/Seeker)
- `PUT /api/requests/:id/status` - Update request status (Distributor)

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/register` - Register FCM token

## 🗺️ Map Features

The interactive map includes:

- **Role-based Views:**
  - **Donators**: See nearby food centers (blue markers)
  - **Acceptors**: See nearby food centers (blue markers)
  - **Distributors**: See donations (red markers) and requests (orange markers)

- **Features:**
  - User location marker (green)
  - Custom colored markers for different types
  - Click markers to see details in bottom sheet modal
  - Get directions to locations
  - Distance filtering (5km, 10km, 25km, 50km)
  - Center type filtering (food bank, pantry, shelter, distribution center)
  - Real-time updates from Firestore

- **Actions:**
  - Donators: "Donate Here" button on centers
  - Acceptors: "Request Food" button on centers
  - Distributors: "Claim Donation" / "Fulfill Request" buttons

## 🚨 Troubleshooting

### Backend Issues
- **Firebase errors**: Backend runs without Firebase credentials, but Firebase features won't work. Add credentials to `.env` file
- **Port 3000 in use**: Change `PORT` in `.env` or stop the process using port 3000
- **Geocoding errors**: Check internet connection (uses OpenStreetMap API)

### Frontend Issues
- **Map not loading**: Check browser console for errors. Ensure Leaflet CSS is imported
- **Firebase auth errors**: Verify Firebase config in `src/config/firebase.js`
- **Babel errors**: Ensure `.babelrc` exists with correct presets. If you see `babel-preset-expo` errors, delete any `babel.config.js` files that reference Expo
- **Webpack errors**: Check that all dependencies are installed (`npm install`)

### Common Fixes
- Clear browser cache and reload
- Restart both backend and frontend servers
- Check browser console for detailed error messages
- Verify Firebase project is set up correctly in Firebase Console

## 📚 File Structure Details

### Backend Routes
- `/api/donations` - Donation management
- `/api/users` - User profile management
- `/api/centers` - Food centers (pantries, food banks)
- `/api/requests` - Food requests from acceptors
- `/api/notifications` - Push notifications (FCM)

### Frontend Pages
- `/login` - User login
- `/register` - User registration (with role selection)
- `/home` - Dashboard (role-based content)
- `/profile` - User profile management
- `/map` - Interactive map (role-based markers)
- `/donations` - List all donations
- `/donations/create` - Create new donation
- `/how-it-works` - Information page
- `/faq` - Frequently asked questions
- `/resources` - Additional resources

### Frontend Components
- `Header` - Universal navigation header
- `MarkerInfoModal` - Bottom sheet for marker details
- `Loader` - Loading indicator
- `UserContext` - Global user state management

## 🔒 Security

- All API endpoints require Firebase authentication
- Role-based access control enforced
- Input validation on all endpoints
- Environment variables for sensitive data
- Secure token-based authentication
- CORS configured for frontend domain

## 🎨 UI/UX Features

- Modern gradient designs
- Smooth animations and transitions
- Responsive layout for all screen sizes
- Mobile-friendly navigation menu
- Role-based color coding
- Loading states and feedback
- Error handling with user-friendly messages

## 📄 License

ISC
