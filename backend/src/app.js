// =====================================================================
// Express Application Setup
// Configures middlewares, static file serving, routes, and error handling
// =====================================================================

const path = require('path');
const express = require('express');
const cors = require('cors');
const opportunityRoutes = require('./routes/opportunityRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Enable Cross-Origin Resource Sharing (CORS) for all origins
app.use(cors());

// Parse incoming JSON and URL-encoded request payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets from both root ('/') and '/frontend'
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));
app.use('/frontend', express.static(frontendPath));

// Root route sends the main single-page application
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// API Base Information Endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'University Research Opportunity Portal REST API is operational',
    endpoints: {
      opportunities: '/api/opportunities'
    }
  });
});

// Mount Research Opportunity API Routes
app.use('/api/opportunities', opportunityRoutes);

// Catch-all 404 handler for undefined API and static endpoints
app.use(notFoundHandler);

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
