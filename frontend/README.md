# Donr Frontend

A simple React web application for the Donr food donation platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will run on `http://localhost:3001`

## Features

- User authentication (Firebase)
- Role-based access (Donator, Distributor, Acceptor)
- Create and view donations
- User profile management
- Simple, clean UI

## Environment Variables

Create a `.env` file in the root directory with:

```
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
```

## Build

To build for production:
```bash
npm run build
```

The built files will be in the `dist` directory.
