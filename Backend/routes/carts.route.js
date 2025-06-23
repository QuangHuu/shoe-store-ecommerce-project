const express = require('express');
const router = express.Router();
const cartController = require('../controllers/carts.controller'); // Ensure path is correct
const authenticate = require('../middleware/auth.middleware');     // Assuming your authentication middleware

// All cart routes require authentication
// The authenticate middleware will ensure req.user.id is available to the controller

// Get the user's cart (or create one if it doesn't exist)
router.get('/', authenticate, cartController.getUserCart);

// Add an item to the cart
router.post('/items', authenticate, cartController.addItemToCart);

// Update the quantity of an item in the cart
router.put('/items', authenticate, cartController.updateItemQuantity);

// Remove a specific item (or variation) from the cart
router.delete('/items', authenticate, cartController.removeItemFromCart);

// Clear all items from the user's cart
router.delete('/', authenticate, cartController.clearUserCart);

module.exports = router;
