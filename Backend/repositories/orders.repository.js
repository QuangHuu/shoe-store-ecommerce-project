const Order = require('../models/orders.model'); // Import the Order model
const Product = require('../models/products.model'); // Import Product model for stock updates
const mongoose = require('mongoose'); // Import mongoose for ObjectId validation

/**
 * Creates a new order.
 * This function is typically called after a successful checkout process.
 * It takes an array of items (which should be derived from the cart and include snapshot data),
 * user ID, shipping address, and payment details.
 * @param {object} orderData - Object containing order details (user, items, shippingAddress, paymentMethod, etc.).
 * @returns {Promise<Order>} - The newly created order document.
 */
async function createOrder(orderData) {
    const session = await mongoose.startSession(); // Start a session for transaction
    session.startTransaction(); // Start a transaction

    try {
        const newOrder = new Order(orderData);
        await newOrder.save({ session }); // Save the new order within the transaction

        // Decrement product stock for each item in the order
        for (const item of newOrder.items) {
            const product = await Product.findById(item.productId).session(session);

            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found.`);
            }

            // Handle stock for products with sizes/colors or simple stock
            if (product.sizes && product.sizes.length > 0) {
                const sizeIndex = product.sizes.findIndex(s => s.size === item.selectedSize);
                if (sizeIndex === -1 || product.sizes[sizeIndex].stock < item.quantity) {
                    throw new Error(`Insufficient stock for product ${product.name}, size ${item.selectedSize}.`);
                }
                product.sizes[sizeIndex].stock -= item.quantity;
            } else if (product.colors && product.colors.length > 0) {
                const colorIndex = product.colors.findIndex(c => c.color === item.selectedColor);
                if (colorIndex === -1 || product.colors[colorIndex].stock < item.quantity) {
                    throw new Error(`Insufficient stock for product ${product.name}, color ${item.selectedColor}.`);
                }
                product.colors[colorIndex].stock -= item.quantity;
            } else {
                // For simple stock (if no sizes/colors defined)
                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for product ${product.name}.`);
                }
                product.stock -= item.quantity;
            }
            await product.save({ session }); // Save updated product stock within the transaction
        }

        await session.commitTransaction(); // Commit the transaction if all operations succeed
        session.endSession(); // End the session

        // Populate after saving and committing for a clean return
        return await Order.findById(newOrder._id)
            .populate('user', 'username email phoneNumber') // Populate user details including phoneNumber
            .populate('items.productId', 'name images') // Populate product details for each item
            .exec();

    } catch (error) {
        await session.abortTransaction(); // Abort the transaction if any error occurs
        session.endSession(); // End the session
        console.error('Error creating order and updating stock:', error);
        throw error; // Re-throw the error for the service layer to handle
    }
}

/**
 * Retrieves a single order by its ID.
 * @param {string} orderId - The ID of the order.
 * @returns {Promise<Order>} - The order document, populated with user and product details.
 */
async function getOrderById(orderId) {
    return await Order.findById(orderId)
        .populate('user', 'username email phoneNumber') // Populate user details including phoneNumber
        .populate('items.productId', 'name images') // Populate product details for each item
        .exec();
}

/**
 * Retrieves all orders for the currently authenticated user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array<Order>>} - An array of order documents, populated with user and product details.
 */
async function getOrdersByUserId(userId) {
    return await Order.find({ user: userId })
        .populate('user', 'username email phoneNumber') // Populate user details including phoneNumber
        .populate('items.productId', 'name images') // Populate product details for each item
        .sort({ createdAt: -1 }) // Sort by most recent orders first
        .exec();
}

/**
 * Retrieves all orders from the database.
 * Admin-only access, typically.
 * @returns {Promise<Array<Order>>} - An array of all order documents, populated with user and product details.
 */
async function getAllOrders() {
    // `.find({})` without any conditions will return all documents
    return await Order.find({})
        .populate('user', 'username email phoneNumber') // Populate user details including phoneNumber
        .populate('items.productId', 'name images') // Populate product details for each item
        .sort({ createdAt: -1 }) // Sort by most recent orders first (optional, but good for admin views)
        .exec();
}

/**
 * Updates the status of an order.
 * If the new status is 'cancelled', it will also revert product stock.
 * Uses a transaction to ensure atomicity for status update and stock reversion.
 * @param {string} orderId - The ID of the order.
 * @param {string} newStatus - The new order status (e.g., 'shipped', 'delivered', 'cancelled').
 * @returns {Promise<Order>} - The updated order document.
 */
async function updateOrderStatus(orderId, newStatus) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await Order.findById(orderId).session(session);

        if (!order) {
            throw new Error('Order not found.');
        }

        const originalStatus = order.orderStatus; // Get current status before update

        // Update the order status
        order.orderStatus = newStatus;
        await order.save({ session }); // Use save to trigger pre-save hooks and validate enum

        // --- Logic for stock reversion on cancellation ---
        if (newStatus === 'cancelled' && originalStatus !== 'cancelled') {
            // Only revert stock if the order is actually changing TO 'cancelled'
            // and wasn't already cancelled.
            console.log(`Reverting stock for cancelled order: ${orderId}`);
            for (const item of order.items) {
                const product = await Product.findById(item.productId).session(session);

                if (!product) {
                    console.warn(`Product with ID ${item.productId} not found during cancellation stock revert.`);
                    continue; // Skip to next item
                }

                // Increment stock based on how it was decremented during creation
                if (product.sizes && product.sizes.length > 0 && item.selectedSize) {
                    const sizeIndex = product.sizes.findIndex(s => s.size === item.selectedSize);
                    if (sizeIndex !== -1) {
                        product.sizes[sizeIndex].stock += item.quantity;
                    }
                } else if (product.colors && product.colors.length > 0 && item.selectedColor) {
                    const colorIndex = product.colors.findIndex(c => c.color === item.selectedColor);
                    if (colorIndex !== -1) {
                        product.colors[colorIndex].stock += item.quantity;
                    }
                } else {
                    // For simple stock
                    product.stock += item.quantity;
                }
                await product.save({ session }); // Save updated product stock within the transaction
            }
        }
        // --- End Logic ---

        await session.commitTransaction();
        session.endSession();

        // Populate and return the updated order
        return await Order.findById(order._id)
            .populate('user', 'username email phoneNumber')
            .populate('items.productId', 'name images')
            .exec();

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error updating order status and reverting stock:', error);
        throw error;
    }
}

/**
 * Updates the payment status of an order.
 * @param {string} orderId - The ID of the order.
 * @param {string} newPaymentStatus - The new payment status (e.g., 'paid', 'refunded').
 * @returns {Promise<Order>} - The updated order document.
 */
async function updatePaymentStatus(orderId, newPaymentStatus) {
    return await Order.findByIdAndUpdate(
        orderId,
        { $set: { paymentStatus: newPaymentStatus } },
        { new: true, runValidators: true }
    ).populate('user', 'username email phoneNumber') // Populate user details including phoneNumber
        .populate('items.productId', 'name images')
        .exec();
}

/**
 * Deletes an order by its ID and increments product stock.
 * This should be used with caution, typically for genuinely erroneous orders or admin purposes.
 * It uses a transaction to ensure stock is reverted atomically with order deletion.
 * @param {string} orderId - The ID of the order to delete.
 * @returns {Promise<Order>} - The deleted order document.
 */
async function deleteOrder(orderId) {
    const session = await mongoose.startSession(); // Start a session for transaction
    session.startTransaction(); // Start a transaction

    try {
        // 1. Find the order to get its items before deleting
        const orderToDelete = await Order.findById(orderId).session(session);

        if (!orderToDelete) {
            throw new Error('Order not found.');
        }

        // 2. Increment stock for each item in the order
        for (const item of orderToDelete.items) {
            const product = await Product.findById(item.productId).session(session);

            if (!product) {
                console.warn(`Product with ID ${item.productId} not found during order deletion. Stock not reverted.`);
                continue; // Skip to next item
            }

            // Increment stock based on how it was decremented during creation
            if (product.sizes && product.sizes.length > 0 && item.selectedSize) {
                const sizeIndex = product.sizes.findIndex(s => s.size === item.selectedSize);
                if (sizeIndex !== -1) {
                    product.sizes[sizeIndex].stock += item.quantity;
                }
            } else if (product.colors && product.colors.length > 0 && item.selectedColor) {
                const colorIndex = product.colors.findIndex(c => c.color === item.selectedColor);
                if (colorIndex !== -1) {
                    product.colors[colorIndex].stock += item.quantity;
                }
            } else {
                // For simple stock
                product.stock += item.quantity;
            }
            await product.save({ session }); // Save updated product stock within the transaction
        }

        // 3. Delete the order
        const deletedOrder = await Order.findByIdAndDelete(orderId, { session }).exec();

        await session.commitTransaction(); // Commit the transaction if all operations succeed
        session.endSession(); // End the session

        return deletedOrder;

    } catch (error) {
        await session.abortTransaction(); // Abort the transaction if any error occurs
        session.endSession(); // End the session
        console.error('Error deleting order and reverting stock:', error);
        throw error; // Re-throw the error for the service layer to handle
    }
}

module.exports = {
    createOrder,
    getOrderById,
    getOrdersByUserId,
    getAllOrders,
    updateOrderStatus,
    updatePaymentStatus,
    deleteOrder,
};
