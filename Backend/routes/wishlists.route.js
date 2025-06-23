const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlists.controller');
const authenticate = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/isAdmin.middleware');

/**
 * Wishlist Routes
 * All routes are authenticated; some admin routes can be adjusted if needed
 */

// GET wishlist for a user
router.get('/:userId', authenticate, wishlistController.getWishlist);

// Create a wishlist (or add initial products)
router.post('/:userId', authenticate, wishlistController.createWishlist);

// Add a product to wishlist
router.post('/:userId/add', authenticate, wishlistController.addProductToWishlist);

// Remove a product from wishlist
router.delete('/:userId/remove', authenticate, wishlistController.removeProductFromWishlist);

// Delete a user's entire wishlist (e.g., by admin or account cleanup)
router.delete('/:userId', authenticate, isAdmin, wishlistController.deleteWishlist);

module.exports = router;
