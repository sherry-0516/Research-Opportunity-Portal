// =====================================================================
// Research Opportunity Routes
// Maps endpoints to validation middlewares and controller functions
// Base Path: /api/opportunities
// =====================================================================

const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');
const { validateId, validateCreate, validateUpdate } = require('../middleware/validate');

// 1. POST /api/opportunities - Create a new opportunity
router.post('/', validateCreate, opportunityController.createOpportunity);

// 2. GET /api/opportunities - Retrieve all opportunities
router.get('/', opportunityController.getAllOpportunities);

// 3. GET /api/opportunities/:id - Retrieve a specific opportunity by ID
router.get('/:id', validateId, opportunityController.getOpportunityById);

// 4. PUT /api/opportunities/:id - Update an opportunity by ID
router.put('/:id', validateId, validateUpdate, opportunityController.updateOpportunity);

// 5. DELETE /api/opportunities/:id - Delete an opportunity by ID
router.delete('/:id', validateId, opportunityController.deleteOpportunity);

module.exports = router;
