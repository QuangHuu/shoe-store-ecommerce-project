const express = require('express');
const router = express.Router();
const productController = require('../controllers/products.controller');
const authenticate = require('../middleware/auth.middleware');         // Require authentication
const isAdmin = require('../middleware/isAdmin.middleware');             // Require admin role

// Public routes
router.get('/', productController.getAllProducts);                                         // Get all products
router.get('/:id', productController.getProductById);                                       // Get product by ID
router.get('/search/suggestions', productController.getProductsBySearch);                     // Search products
router.get('/category/:categoryId', productController.getProductsByCategory);             // Get products by category
router.get('/recommendations/:productId', productController.getProductRecommendations);  // Get product recommendations
router.get('/brand/:brandId', productController.getProductsByBrand);                     // Get products by brand

// New Listing Routes
router.get('/new-arrivals', productController.getNewArrivalProductsController);           // Get new arrival products
router.get('/on-sale', productController.getOnSaleProductsController);                    // Get on sale products
router.get('/exclusive', productController.getExclusiveProductsController);               // Get exclusive products
router.get('/coming-soon', productController.getComingSoonProductsController);            // Get coming soon products

// Rating routes. These are public
router.post('/rating', productController.addRating);                                     // Add a rating to a product
router.get('/ratings/:productId', productController.getRatingsByProduct);                // Get ratings by product ID

// Comment routes. These are public
router.post('/comment', productController.addComment);                                        // Add a comment to a product
router.get('/comments/:productId', productController.getCommentsByProduct);                   // Get comments by product ID

// Protected routes (require authentication and admin role)
router.post('/', authenticate, isAdmin, productController.createProduct);                       // Create a new product
router.put('/:id', authenticate, isAdmin, productController.updateProduct);                       // Update a product by ID.
router.delete('/:id', authenticate, isAdmin, productController.deleteProduct);                    // Delete a product by ID

module.exports = router;

