const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brands.controller'); // Import the brand controller
const authenticate = require('../middleware/auth.middleware'); // Require authentication middleware
const isAdmin = require('../middleware/isAdmin.middleware');     // Require admin role middleware

// Public routes
router.get('/', brandController.getAllBrands);          // Get all brands
router.get('/:id', brandController.getBrandById);        // Get brand by ID
router.get('/name/:name', brandController.getBrandByName); // Get brand by Name

// Protected routes (require authentication and admin role)
router.post('/', authenticate, isAdmin, brandController.createBrand);       // Create a new brand
router.put('/:id', authenticate, isAdmin, brandController.updateBrand);     // Update a brand by ID 
router.delete('/:id', authenticate, isAdmin, brandController.deleteBrand);  // Delete a brand by ID

module.exports = router;
