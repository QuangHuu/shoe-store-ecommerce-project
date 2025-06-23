const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categories.controller'); // Import the category controller
const authenticate = require('../middleware/auth.middleware'); // Require authentication middleware
const isAdmin = require('../middleware/isAdmin.middleware');   // Require admin role middleware

// Public routes for fetching categories
// GET /api/categories - Retrieves all categories (main and sub)
router.get('/', categoryController.getAllCategoriesController);
// GET /api/categories/:id - Retrieves a single category by ID
router.get('/:id', categoryController.getCategoryByIdController);

// IMPORTANT: Order matters! Specific routes should come before more general ones.
// Placing ':name' and ':slug' after more specific paths like 'main' prevents conflicts.

// GET /api/categories/main - Retrieves only main categories
router.get('/main', categoryController.getMainCategoriesController);
// GET /api/categories/:mainCategoryId/subcategories - Retrieves subcategories for a given main category
router.get('/:mainCategoryId/subcategories', categoryController.getSubcategoriesByParentController);

// GET /api/categories/by-name/:name - Retrieves category by Name (changed path for clarity)
router.get('/by-name/:name', categoryController.getCategoryByNameController);
// GET /api/categories/by-slug/:slug - Retrieves category by Slug (changed path for clarity)
router.get('/by-slug/:slug', categoryController.getCategoryBySlugController);


// Protected routes (require authentication and admin role)
// POST /api/categories - Create a new category
router.post('/', authenticate, isAdmin, categoryController.createCategoryController);
// PUT /api/categories/:id - Update a category by ID (using PUT for full replacement)
router.put('/:id', authenticate, isAdmin, categoryController.updateCategoryController);
// DELETE /api/categories/:id - Delete a category by ID
router.delete('/:id', authenticate, isAdmin, categoryController.deleteCategoryController);

module.exports = router;
