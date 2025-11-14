# Donr Backend API

Backend server for the Donr food donation app.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Configure your Firebase Admin SDK credentials and Google Maps API key in `.env`.

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### Health Check
- `GET /health` - Check API status

### Users
- `POST /api/users` - Create user profile
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile

### Donations
- `POST /api/donations` - Create donation (Donator only)
- `GET /api/donations?lat=&lng=&radius=` - Get nearby donations (Distributor/Acceptor)
- `PUT /api/donations/:id/claim` - Claim donation (Distributor only)
- `PUT /api/donations/:id/distribute` - Mark as distributed (Distributor only)

### Notifications
- `POST /api/notifications/send` - Send notification

## Authentication

All endpoints (except `/health`) require a Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

