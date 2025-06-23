const cartsService = require('../services/carts.service'); // Ensure path is correct

/**
 * Get the current user's cart. If no cart exists, create one.
 * GET /api/cart
 */
async function getUserCart(req, res) {
    try {
        const userId = req.user.id; // Assuming userId is available from authentication middleware
        const cart = await cartsService.getOrCreateUserCart(userId);
        res.status(200).json(cart); // 200 OK
    } catch (error) {
        console.error('Error in getUserCart controller:', error.message);
        res.status(500).json({ message: 'Failed to retrieve or create cart.' }); // 500 Internal Server Error
    }
}

/**
 * Add an item to the user's cart.
 * POST /api/cart/items
 * Request body: { productId, quantity, selectedSize?, selectedColor? }
 */
async function addItemToCart(req, res) {
    try {
        const userId = req.user.id; // Assuming userId is available from authentication middleware
        const { productId, quantity, selectedSize, selectedColor } = req.body;

        if (!productId || !quantity || quantity < 1) {
            return res.status(400).json({ message: 'Product ID and quantity (must be at least 1) are required.' }); // 400 Bad Request
        }

        const updatedCart = await cartsService.addItemToCart(
            userId,
            productId,
            quantity,
            selectedSize,
            selectedColor
        );
        res.status(200).json(updatedCart); // 200 OK (or 201 Created if preferred for adds)
    } catch (error) {
        console.error('Error in addItemToCart controller:', error.message);
        if (error.message.includes('Product not found') || error.message.includes('stock')) {
            return res.status(400).json({ message: error.message }); // 400 for business logic errors
        }
        res.status(500).json({ message: 'Failed to add item to cart.' }); // 500 Internal Server Error
    }
}

/**
 * Remove a specific item (or variation) from the user's cart.
 * DELETE /api/cart/items
 * Request body: { productId, selectedSize?, selectedColor? }
 */
async function removeItemFromCart(req, res) {
    try {
        const userId = req.user.id; // Assuming userId is available from authentication middleware
        const { productId, selectedSize, selectedColor } = req.body; // Using body for consistency with addItem

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required to remove an item.' }); // 400 Bad Request
        }

        const updatedCart = await cartsService.removeItemFromCart(
            userId,
            productId,
            selectedSize,
            selectedColor
        );
        res.status(200).json(updatedCart); // 200 OK
    } catch (error) {
        console.error('Error in removeItemFromCart controller:', error.message);
        if (error.message.includes('Cart not found') || error.message.includes('Item not found')) {
            return res.status(404).json({ message: error.message }); // 404 Not Found
        }
        res.status(500).json({ message: 'Failed to remove item from cart.' }); // 500 Internal Server Error
    }
}

/**
 * Update the quantity of a specific item in the user's cart.
 * PUT /api/cart/items
 * Request body: { productId, newQuantity, selectedSize?, selectedColor? }
 */
async function updateItemQuantity(req, res) {
    try {
        const userId = req.user.id; // Assuming userId is available from authentication middleware
        const { productId, newQuantity, selectedSize, selectedColor } = req.body;

        if (!productId || newQuantity === undefined) {
            return res.status(400).json({ message: 'Product ID and new quantity are required.' }); // 400 Bad Request
        }
        if (typeof newQuantity !== 'number' || newQuantity < 0) {
             return res.status(400).json({ message: 'New quantity must be a non-negative number.' }); // 400 Bad Request
        }

        const updatedCart = await cartsService.updateItemQuantity(
            userId,
            productId,
            newQuantity,
            selectedSize,
            selectedColor
        );
        res.status(200).json(updatedCart); // 200 OK
    } catch (error) {
        console.error('Error in updateItemQuantity controller:', error.message);
        if (error.message.includes('Cart not found') || error.message.includes('Item not found')) {
            return res.status(404).json({ message: error.message }); // 404 Not Found
        }
        if (error.message.includes('stock')) {
            return res.status(400).json({ message: error.message }); // 400 for stock issues
        }
        res.status(500).json({ message: 'Failed to update item quantity in cart.' }); // 500 Internal Server Error
    }
}

/**
 * Clear all items from the user's cart.
 * DELETE /api/cart
 */
async function clearUserCart(req, res) {
    try {
        const userId = req.user.id; // Assuming userId is available from authentication middleware
        const clearedCart = await cartsService.clearUserCart(userId);
        res.status(200).json({ message: 'Cart cleared successfully.', cart: clearedCart }); // 200 OK
    } catch (error) {
        console.error('Error in clearUserCart controller:', error.message);
        if (error.message.includes('Cart not found')) {
            return res.status(404).json({ message: error.message }); // 404 Not Found
        }
        res.status(500).json({ message: 'Failed to clear cart.' }); // 500 Internal Server Error
    }
}

module.exports = {
    getUserCart,
    addItemToCart,
    removeItemFromCart,
    updateItemQuantity,
    clearUserCart
};
