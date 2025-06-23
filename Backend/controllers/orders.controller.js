const ordersService = require('../services/orders.service'); 
const mongoose = require('mongoose'); 

/**
 * Controller to create a new order from a user's cart.
 * POST /api/orders/from-cart
 * Request body: { shippingAddress, paymentMethod }
 * Assumes userId is available from req.user.id (from authentication middleware)
 */
async function createOrderFromCartController(req, res) {
    try {
        const userId = req.user.id; // Get userId from authenticated user
        const { shippingAddress, paymentMethod } = req.body;

        // Basic validation for required fields in controller
        if (!shippingAddress || !paymentMethod) {
            return res.status(400).json({ message: 'Shipping address and payment method are required.' });
        }

        const newOrder = await ordersService.createOrderFromCart(userId, shippingAddress, paymentMethod);
        res.status(201).json(newOrder); // 201 Created
    } catch (error) {
        console.error('Error in createOrderFromCartController:', error.message);
        // Distinguish between client-side errors (e.g., empty cart, insufficient stock) and server errors
        if (error.message.includes('cart') || error.message.includes('stock') || error.message.includes('Product not found')) {
            return res.status(400).json({ message: error.message }); // 400 Bad Request for business logic errors
        }
        res.status(500).json({ message: 'Failed to create order from cart.' }); // 500 Internal Server Error
    }
}

/**
 * Controller to create a new order directly for a single product.
 * POST /api/orders/direct
 * Request body: { productId, quantity, shippingAddress, paymentMethod, selectedSize?, selectedColor? }
 * Assumes userId is available from req.user.id (from authentication middleware)
 */
async function createDirectOrderController(req, res) {
    try {
        const userId = req.user.id; // Get userId from authenticated user
        const { productId, quantity, shippingAddress, paymentMethod, selectedSize, selectedColor } = req.body;

        // Basic validation for required fields in controller
        if (!productId || !quantity || quantity < 1 || !shippingAddress || !paymentMethod) {
            return res.status(400).json({ message: 'Product ID, quantity (must be at least 1), shipping address, and payment method are required.' });
        }

        const newOrder = await ordersService.createDirectOrder(
            userId,
            productId,
            quantity,
            shippingAddress,
            paymentMethod,
            selectedSize,
            selectedColor
        );
        res.status(201).json(newOrder); // 201 Created
    } catch (error) {
        console.error('Error in createDirectOrderController:', error.message);
        // Distinguish between client-side errors (e.g., product not found, insufficient stock) and server errors
        if (error.message.includes('Product not found') || error.message.includes('stock')) {
            return res.status(400).json({ message: error.message }); // 400 Bad Request for business logic errors
        }
        res.status(500).json({ message: 'Failed to create direct order.' }); // 500 Internal Server Error
    }
}

/**
 * Controller to retrieve a single order by its ID.
 * GET /api/orders/:orderId
 */
async function getOrderByIdController(req, res) {
    try {
        const orderId = req.params.orderId;
        const order = await ordersService.getOrderById(orderId);
        res.status(200).json(order); // 200 OK
    } catch (error) {
        console.error('Error in getOrderByIdController:', error.message);
        if (error.message.includes('Order not found')) {
            return res.status(404).json({ message: error.message }); // 404 Not Found
        }
        if (error.message.includes('Invalid order ID')) {
            return res.status(400).json({ message: error.message }); // 400 Bad Request
        }
        res.status(500).json({ message: 'Failed to retrieve order.' }); // 500 Internal Server Error
    }
}

/**
 * Controller to retrieve all orders for a specific user.
 * GET /api/orders/user/:userId (Admin route, or use req.user.id for current user)
 * Or GET /api/orders/my-orders (if userId is from auth middleware)
 */
async function getOrdersByUserIdController(req, res) {
    try {
        // This route can be used in two ways:
        // 1. Admin fetching orders for any user: req.params.userId
        // 2. User fetching their own orders: req.user.id (from auth middleware)
        const targetUserId = req.params.userId || req.user.id; // Prioritize param for admin, fallback to auth user

        // Authorization check: Admin can see any user's orders, normal user can only see their own
        if (!req.user.isAdmin && req.user.id !== targetUserId) {
            return res.status(403).json({ message: 'Forbidden: You can only view your own orders.' });
        }

        const orders = await ordersService.getOrdersByUserId(targetUserId);
        res.status(200).json(orders); // 200 OK
    } catch (error) {
        console.error('Error in getOrdersByUserIdController:', error.message);
        if (error.message.includes('Invalid user ID')) {
            return res.status(400).json({ message: error.message }); // 400 Bad Request
        }
        res.status(500).json({ message: 'Failed to retrieve user orders.' }); // 500 Internal Server Error
    }
}

/**
 * Controller to retrieve all orders.
 * GET /api/orders/ (Admin-only access)
 */
async function getAllOrdersController(req, res) {
    try {
        const orders = await ordersService.getAllOrders();
        res.status(200).json(orders); // 200 OK
    } catch (error) {
        console.error('Error in getAllOrdersController:', error.message);
        res.status(500).json({ message: 'Failed to retrieve all orders.' }); // 500 Internal Server Error
    }
}

/**
 * Controller to update the status of an order (Admin only).
 * PATCH /api/orders/:orderId/status
 * Request body: { newStatus }
 */
async function updateOrderStatusController(req, res) {
    try {
        const orderId = req.params.orderId;
        const { newStatus } = req.body;

        if (!newStatus) {
            return res.status(400).json({ message: 'New status is required.' });
        }

        const updatedOrder = await ordersService.updateOrderStatus(orderId, newStatus);
        res.status(200).json(updatedOrder); // 200 OK
    } catch (error) {
        console.error('Error in updateOrderStatusController:', error.message);
        if (error.message.includes('Order not found')) {
            return res.status(404).json({ message: error.message }); // 404 Not Found
        }
        if (error.message.includes('Invalid order ID') || error.message.includes('Invalid order status')) {
            return res.status(400).json({ message: error.message }); // 400 Bad Request
        }
        res.status(500).json({ message: 'Failed to update order status.' }); // 500 Internal Server Error
    }
}

/**
 * Controller to update the payment status of an order (Admin or webhook).
 * PATCH /api/orders/:orderId/payment-status
 * Request body: { newPaymentStatus }
 */
async function updatePaymentStatusController(req, res) {
    try {
        const orderId = req.params.orderId;
        const { newPaymentStatus } = req.body;

        if (!newPaymentStatus) {
            return res.status(400).json({ message: 'New payment status is required.' });
        }

        const updatedOrder = await ordersService.updatePaymentStatus(orderId, newPaymentStatus);
        res.status(200).json(updatedOrder); // 200 OK
    } catch (error) {
        console.error('Error in updatePaymentStatusController:', error.message);
        if (error.message.includes('Order not found')) {
            return res.status(404).json({ message: error.message }); // 404 Not Found
        }
        if (error.message.includes('Invalid order ID') || error.message.includes('Invalid payment status')) {
            return res.status(400).json({ message: error.message }); // 400 Bad Request
        }
        res.status(500).json({ message: 'Failed to update payment status.' }); // 500 Internal Server Error
    }
}

/**
 * Controller to delete an order (Admin only, use with caution).
 * DELETE /api/orders/:orderId
 */
async function deleteOrderController(req, res) {
    try {
        const orderId = req.params.orderId;
        const deletedOrder = await ordersService.deleteOrder(orderId);
        res.status(200).json({ message: 'Order deleted successfully.', deletedOrder }); // 200 OK
    } catch (error) {
        console.error('Error in deleteOrderController:', error.message);
        if (error.message.includes('Order not found')) {
            return res.status(404).json({ message: error.message }); // 404 Not Found
        }
        if (error.message.includes('Invalid order ID')) {
            return res.status(400).json({ message: error.message }); // 400 Bad Request
        }
        res.status(500).json({ message: 'Failed to delete order.' }); // 500 Internal Server Error
    }
}

module.exports = {
    createOrderFromCartController,
    createDirectOrderController,
    getOrderByIdController,
    getOrdersByUserIdController,
    getAllOrdersController, 
    updateOrderStatusController,
    updatePaymentStatusController,
    deleteOrderController
};
