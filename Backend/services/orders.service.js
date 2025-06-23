const ordersRepository = require('../repositories/orders.repository');
const cartsService = require('./carts.service');
const productService = require('./products.service');
const mongoose = require('mongoose'); 

/**
 * Creates a new order from a user's cart.
 * This function handles fetching cart details, validating stock,
 * snapshotting product information, and clearing the cart.
 * @param {string} userId - The ID of the user placing the order.
 * @param {object} shippingAddress - The shipping address details.
 * @param {string} paymentMethod - The chosen payment method.
 * @returns {Promise<Order>} - The newly created order document.
 * @throws {Error} - If cart is empty, product is out of stock, or other issues.
 */
async function createOrderFromCart(userId, shippingAddress, paymentMethod) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID.');
    }

    // 1. Get the user's cart
    const cart = await cartsService.getOrCreateUserCart(userId);

    if (!cart || cart.items.length === 0) {
        throw new Error('Cannot create an order from an empty cart.');
    }

    const orderItems = [];
    let calculatedTotalAmount = 0;

    // 2. Iterate through cart items, validate stock, and snapshot product details
    for (const cartItem of cart.items) {
        const product = await productService.getProductById(cartItem.product._id); // Get latest product details

        if (!product) {
            throw new Error(`Product with ID ${cartItem.product._id} not found.`);
        }

        let availableStock = 0;
        // Determine available stock based on sizes/colors or simple stock
        if (cartItem.selectedSize && product.sizes && product.sizes.length > 0) {
            const sizeOption = product.sizes.find(s => s.size === cartItem.selectedSize);
            if (!sizeOption) {
                throw new Error(`Size ${cartItem.selectedSize} not found for product ${product.name}.`);
            }
            availableStock = sizeOption.stock;
        } else if (cartItem.selectedColor && product.colors && product.colors.length > 0) {
            const colorOption = product.colors.find(c => c.color === cartItem.selectedColor);
            if (!colorOption) {
                throw new Error(`Color ${cartItem.selectedColor} not found for product ${product.name}.`);
            }
            availableStock = colorOption.stock;
        } else {
            availableStock = product.stock;
        }

        if (availableStock < cartItem.quantity) {
            throw new Error(`Insufficient stock for product: ${product.name} (Size: ${cartItem.selectedSize || 'N/A'}, Color: ${cartItem.selectedColor || 'N/A'}). Requested: ${cartItem.quantity}, Available: ${availableStock}.`);
        }

        // Snapshot product details at the time of order
        const effectivePrice = (product.onSale && product.salePrice !== undefined && product.salePrice < product.price)
            ? product.salePrice
            : product.price;

        orderItems.push({
            productId: product._id,
            name: product.name,
            price: product.price, // Original price
            salePrice: product.salePrice, // Sale price (can be null/undefined)
            quantity: cartItem.quantity,
            selectedSize: cartItem.selectedSize,
            selectedColor: cartItem.selectedColor,
            imageUrl: product.images && product.images.length > 0 ? product.images[0] : null // Assuming first image is primary
        });

        calculatedTotalAmount += effectivePrice * cartItem.quantity;
    }

    // 3. Prepare order data for repository
    const orderData = {
        user: userId,
        items: orderItems,
        totalAmount: calculatedTotalAmount, // This will be recalculated by model's pre-save hook anyway, but good for clarity
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        orderStatus: 'pending', // Default status
        paymentStatus: 'pending' // Default payment status
    };

    // 4. Create the order and decrement stock via repository (transactional)
    const newOrder = await ordersRepository.createOrder(orderData);

    // 5. Clear the user's cart after successful order creation
    await cartsService.clearUserCart(userId);

    return newOrder;
}

/**
 * Creates a new order directly for a single product, bypassing the cart.
 * This function handles validating stock and snapshotting product information.
 * @param {string} userId - The ID of the user placing the order.
 * @param {string} productId - The ID of the product to order.
 * @param {number} quantity - The quantity of the product.
 * @param {object} shippingAddress - The shipping address details.
 * @param {string} paymentMethod - The chosen payment method.
 * @param {string} [selectedSize] - The selected size (optional).
 * @param {string} [selectedColor] - The selected color (optional).
 * @returns {Promise<Order>} - The newly created order document.
 * @throws {Error} - If product is not found, out of stock, or other issues.
 */
async function createDirectOrder(userId, productId, quantity, shippingAddress, paymentMethod, selectedSize, selectedColor) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID.');
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('Invalid product ID.');
    }
    if (quantity < 1) {
        throw new Error('Quantity must be at least 1.');
    }

    const product = await productService.getProductById(productId);

    if (!product) {
        throw new Error(`Product with ID ${productId} not found.`);
    }

    let availableStock = 0;
    // Determine available stock based on sizes/colors or simple stock
    if (selectedSize && product.sizes && product.sizes.length > 0) {
        const sizeOption = product.sizes.find(s => s.size === selectedSize);
        if (!sizeOption) {
            throw new Error(`Size ${selectedSize} not found for product ${product.name}.`);
        }
        availableStock = sizeOption.stock;
    } else if (selectedColor && product.colors && product.colors.length > 0) {
        const colorOption = product.colors.find(c => c.color === selectedColor);
        if (!colorOption) {
            throw new Error(`Color ${selectedColor} not found for product ${product.name}.`);
        }
        availableStock = colorOption.stock;
    } else {
        availableStock = product.stock;
    }

    if (availableStock < quantity) {
        throw new Error(`Insufficient stock for product: ${product.name} (Size: ${selectedSize || 'N/A'}, Color: ${selectedColor || 'N/A'}). Requested: ${quantity}, Available: ${availableStock}.`);
    }

    // Snapshot product details at the time of order
    const effectivePrice = (product.onSale && product.salePrice !== undefined && product.salePrice < product.price)
        ? product.salePrice
        : product.price;

    const orderItems = [{
        productId: product._id,
        name: product.name,
        price: product.price, // Original price
        salePrice: product.salePrice, // Sale price (can be null/undefined)
        quantity: quantity,
        selectedSize: selectedSize,
        selectedColor: selectedColor,
        imageUrl: product.images && product.images.length > 0 ? product.images[0] : null // Assuming first image is primary
    }];

    const calculatedTotalAmount = effectivePrice * quantity;

    // Prepare order data for repository
    const orderData = {
        user: userId,
        items: orderItems,
        totalAmount: calculatedTotalAmount, // This will be recalculated by model's pre-save hook anyway, but good for clarity
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        orderStatus: 'pending', // Default status
        paymentStatus: 'pending' // Default payment status
    };

    // Create the order and decrement stock via repository (transactional)
    const newOrder = await ordersRepository.createOrder(orderData);

    return newOrder;
}


/**
 * Retrieves a single order by its ID.
 * @param {string} orderId - The ID of the order.
 * @returns {Promise<Order>} - The order document, populated with user and product details.
 * @throws {Error} - If order ID is invalid or order not found.
 */
async function getOrderById(orderId) {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new Error('Invalid order ID.');
    }
    const order = await ordersRepository.getOrderById(orderId);
    if (!order) {
        throw new Error('Order not found.');
    }
    return order;
}

/**
 * Retrieves all orders for a specific user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array<Order>>} - An array of order documents, populated with user and product details.
 * @throws {Error} - If user ID is invalid.
 */
async function getOrdersByUserId(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID.');
    }
    const orders = await ordersRepository.getOrdersByUserId(userId);
    return orders;
}

/**
 * Retrieves all orders from the database.
 * This function is for admin use to get a comprehensive list of all orders.
 * @returns {Promise<Array<Order>>} - An array of all order documents, populated with user and product details.
 */
async function getAllOrders() {
    const orders = await ordersRepository.getAllOrders();
    return orders;
}

/**
 * Updates the status of an order.
 * This function can be used by an administrator to manage order fulfillment.
 * @param {string} orderId - The ID of the order.
 * @param {string} newStatus - The new order status (e.g., 'processing', 'shipped', 'delivered', 'cancelled').
 * @returns {Promise<Order>} - The updated order document.
 * @throws {Error} - If order ID is invalid, order not found, or status transition is invalid.
 */
async function updateOrderStatus(orderId, newStatus) {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new Error('Invalid order ID.');
    }
    // Optional: Add business logic here to validate status transitions
    // e.g., cannot go from 'delivered' to 'pending' directly.
    const order = await ordersRepository.getOrderById(orderId);
    if (!order) {
        throw new Error('Order not found.');
    }
    // Example of simple status validation:
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
    if (!validStatuses.includes(newStatus)) {
        throw new Error(`Invalid order status: ${newStatus}.`);
    }
    // Further checks could be:
    // if (order.orderStatus === 'delivered' && newStatus !== 'returned') {
    //     throw new Error('Cannot change status of a delivered order unless returning.');
    // }

    const updatedOrder = await ordersRepository.updateOrderStatus(orderId, newStatus);
    return updatedOrder;
}

/**
 * Updates the payment status of an order.
 * This function can be used by an administrator or a payment gateway callback.
 * @param {string} orderId - The ID of the order.
 * @param {string} newPaymentStatus - The new payment status (e.g., 'paid', 'failed', 'refunded').
 * @returns {Promise<Order>} - The updated order document.
 * @throws {Error} - If order ID is invalid, order not found, or payment status transition is invalid.
 */
async function updatePaymentStatus(orderId, newPaymentStatus) {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new Error('Invalid order ID.');
    }
    // Optional: Add business logic here to validate payment status transitions
    const order = await ordersRepository.getOrderById(orderId);
    if (!order) {
        throw new Error('Order not found.');
    }
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(newPaymentStatus)) {
        throw new Error(`Invalid payment status: ${newPaymentStatus}.`);
    }

    const updatedOrder = await ordersRepository.updatePaymentStatus(orderId, newPaymentStatus);
    return updatedOrder;
}

/**
 * Deletes an order by its ID.
 * This should be used with extreme caution, typically for failed orders or admin purposes.
 * Consider soft deletes (e.g., setting an 'isActive' flag) instead of hard deletes in production.
 * @param {string} orderId - The ID of the order to delete.
 * @returns {Promise<Order>} - The deleted order document.
 * @throws {Error} - If order ID is invalid or order not found.
 */
async function deleteOrder(orderId) {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new Error('Invalid order ID.');
    }
    const deletedOrder = await ordersRepository.deleteOrder(orderId);
    if (!deletedOrder) {
        throw new Error('Order not found.');
    }
    return deletedOrder;
}

module.exports = {
    createOrderFromCart,
    createDirectOrder,
    getOrderById,
    getOrdersByUserId,
    getAllOrders, 
    updateOrderStatus,
    updatePaymentStatus,
    deleteOrder
};
