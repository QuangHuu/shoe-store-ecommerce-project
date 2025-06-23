const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/orders.controller'); // Import the orders controller
const authenticate = require('../middleware/auth.middleware');  // For authenticated users
const isAdmin = require('../middleware/isAdmin.middleware'); // For admin role checking

// Public Routes (require authentication as they involve user-specific data)

// Create a new order from the user's cart
router.post('/from-cart', authenticate, ordersController.createOrderFromCartController);

// Create a new order directly for a single product
router.post('/direct', authenticate, ordersController.createDirectOrderController);

// --- IMPORTANT: ORDERING OF GET ROUTES FOR SPECIFICITY (as recommended by FE AI) ---

// Retrieve all orders for the currently authenticated user (MOST SPECIFIC GET path)
// This must come BEFORE any parameterized GET routes like /:orderId
router.get('/my-orders', authenticate, ordersController.getOrdersByUserIdController);

// Admin Routes (require authentication and admin role)
// These routes are also ordered from more specific to less specific where parameters are involved.

// Retrieve all orders from all users (Admin-only access)
// The root path '/' is specific and won't conflict with /:orderId or /my-orders.
router.get('/', authenticate, isAdmin, ordersController.getAllOrdersController);

// Retrieve all orders for a specific user (Admin-only access)
// More specific than just /:orderId because of the /user/ prefix.
router.get('/user/:userId', authenticate, isAdmin, ordersController.getOrdersByUserIdController);

// Retrieve a single order by its ID (GENERIC PARAMETERIZED GET path)
// This comes AFTER all other specific GET routes to avoid conflicts.
router.get('/:orderId', authenticate, ordersController.getOrderByIdController);


// --- IMPORTANT: ORDERING OF PATCH ROUTES FOR SPECIFICITY ---

// Update the payment status of an order (Admin-only access)
// This is MORE SPECIFIC than the general /:orderId PATCH, so it must come FIRST.
router.patch('/:orderId/payment-status', authenticate, isAdmin, ordersController.updatePaymentStatusController);

// Update the status of an order (Admin-only access)
// This is a more GENERAL PATCH for an order by ID, so it comes AFTER more specific PATCHes.
// Frontend sends { newStatus: "newStatus" } in request body
router.patch('/:orderId/status', authenticate, isAdmin, ordersController.updateOrderStatusController);
// Note: If you want /:orderId to be the general update and remove /status, then this
// general PATCH /:orderId should always be the LAST PATCH route for that segment.
// However, having separate routes for distinct update types (/status vs /payment-status)
// is generally clearer and allows for specific middleware/logic.

// Delete an order (Admin-only access)
router.delete('/:orderId', authenticate, isAdmin, ordersController.deleteOrderController);

module.exports = router;
