/**
 * Donr Backend Server
 * Main Express server entry point
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { errorHandler, notFound } = require('./middleware/errorHandler');
const donationsRoutes = require('./routes/donations');
const notificationsRoutes = require('./routes/notifications');
const usersRoutes = require('./routes/users');
const centersRoutes = require('./routes/centers');
const requestsRoutes = require('./routes/requests');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:19006',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Donr API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/donations', donationsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/centers', centersRoutes);
app.use('/api/requests', requestsRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Donr API server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;

