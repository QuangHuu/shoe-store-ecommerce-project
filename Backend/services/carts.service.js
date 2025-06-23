const cartsRepository = require('../repositories/carts.repository'); 
const productService = require('./products.service'); 

/**
 * Retrieves a user's cart. If no cart exists, a new one is created.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Cart>} - The user's cart document.
 */
async function getOrCreateUserCart(userId) {
    try {
        let cart = await cartsRepository.getCartByUserId(userId);
        if (!cart) {
            cart = await cartsRepository.createCart(userId);
        }
        return cart;
    } catch (error) {
        console.error('Error in getOrCreateUserCart:', error.message);
        throw new Error('Could not retrieve or create user cart.');
    }
}

/**
 * Adds a product to the user's cart. Handles quantity updates and stock checks.
 * @param {string} userId - The ID of the user.
 * @param {string} productId - The ID of the product to add.
 * @param {number} quantity - The quantity of the product to add.
 * @param {string} [selectedSize] - The selected size (optional).
 * @param {string} [selectedColor] - The selected color (optional).
 * @returns {Promise<Cart>} - The updated cart document.
 * @throws {Error} If product not found, out of stock, or other repository error.
 */
async function addItemToCart(userId, productId, quantity, selectedSize, selectedColor) {
    try {
        // Fetch product details to get current price and salePrice
        const product = await productService.getProductById(productId);
        if (!product) {
            throw new Error('Product not found.');
        }

        // Pass product's current price and salePrice to the repository function
        const updatedCart = await cartsRepository.addItemToCart(
            userId,
            productId,
            quantity,
            product.price,
            product.salePrice, // Will be undefined if not on sale, repository handles this
            selectedSize,
            selectedColor
        );
        return updatedCart;
    } catch (error) {
        console.error('Error in addItemToCart:', error.message);
        // Re-throw the error for the controller to handle
        throw error;
    }
}

/**
 * Removes a specific item (or variation) from the user's cart.
 * @param {string} userId - The ID of the user.
 * @param {string} productId - The ID of the product to remove.
 * @param {string} [selectedSize] - The selected size (optional).
 * @param {string} [selectedColor] - The selected color (optional).
 * @returns {Promise<Cart>} - The updated cart document.
 * @throws {Error} If cart not found or item not found.
 */
async function removeItemFromCart(userId, productId, selectedSize, selectedColor) {
    try {
        const updatedCart = await cartsRepository.removeItemFromCart(userId, productId, selectedSize, selectedColor);
        return updatedCart;
    } catch (error) {
        console.error('Error in removeItemFromCart:', error.message);
        throw error;
    }
}

/**
 * Updates the quantity of a specific item in the user's cart.
 * @param {string} userId - The ID of the user.
 * @param {string} productId - The ID of the product to update.
 * @param {number} newQuantity - The new desired quantity.
 * @param {string} [selectedSize] - The selected size (optional).
 * @param {string} [selectedColor] - The selected color (optional).
 * @returns {Promise<Cart>} - The updated cart document.
 * @throws {Error} If cart or item not found, or stock issues.
 */
async function updateItemQuantity(userId, productId, newQuantity, selectedSize, selectedColor) {
    try {
        const updatedCart = await cartsRepository.updateItemQuantity(
            userId,
            productId,
            newQuantity,
            selectedSize,
            selectedColor
        );
        return updatedCart;
    } catch (error) {
        console.error('Error in updateItemQuantity:', error.message);
        throw error;
    }
}

/**
 * Clears all items from a user's cart.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Cart>} - The updated (empty) cart document.
 * @throws {Error} If cart not found.
 */
async function clearUserCart(userId) {
    try {
        const clearedCart = await cartsRepository.clearCart(userId);
        return clearedCart;
    } catch (error) {
        console.error('Error in clearUserCart:', error.message);
        throw error;
    }
}

module.exports = {
    getOrCreateUserCart,
    addItemToCart,
    removeItemFromCart,
    updateItemQuantity,
    clearUserCart
};
