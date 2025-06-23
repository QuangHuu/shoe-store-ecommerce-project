const Cart = require('../models/carts.model'); // Ensure the path is correct
const Product = require('../models/products.model'); // Need Product model for checking availability

/**
 * Retrieves a user's cart, populating product details.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Cart>} - The cart document.
 */
async function getCartByUserId(userId) {
    // Populate the product details for each item in the cart
    return await Cart.findOne({ user: userId }).populate('items.product');
}

/**
 * Creates a new cart for a user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Cart>} - The newly created cart document.
 */
async function createCart(userId) {
    const newCart = new Cart({ user: userId, items: [], totalPrice: 0 });
    return await newCart.save();
}

/**
 * Adds an item to the cart or updates its quantity if it already exists.
 * @param {string} userId - The ID of the user.
 * @param {string} productId - The ID of the product.
 * @param {number} quantity - The quantity to add.
 * @param {number} price - The current price of the product.
 * @param {number} [salePrice] - The current sale price of the product (optional).
 * @param {string} [selectedSize] - The selected size (optional).
 * @param {string} [selectedColor] - The selected color (optional).
 * @returns {Promise<Cart>} - The updated cart document.
 * @throws {Error} If product is not found or out of stock.
 */
async function addItemToCart(userId, productId, quantity, price, salePrice, selectedSize, selectedColor) {
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        cart = await createCart(userId);
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new Error('Product not found.');
    }
    if (product.stockQuantity < quantity) {
        throw new Error(`Not enough stock for ${product.name}. Available: ${product.stockQuantity}`);
    }

    // Find if the item (with specific variations) already exists in the cart
    const existingItemIndex = cart.items.findIndex(item =>
        item.product.toString() === productId &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );

    if (existingItemIndex > -1) {
        // Update quantity of existing item
        cart.items[existingItemIndex].quantity += quantity;
        // Re-check stock for the new total quantity
        if (product.stockQuantity < cart.items[existingItemIndex].quantity) {
             throw new Error(`Adding ${quantity} exceeds stock for ${product.name}. Max allowed: ${product.stockQuantity - (cart.items[existingItemIndex].quantity - quantity)}`);
        }
    } else {
        // Add new item to cart
        cart.items.push({
            product: productId,
            quantity: quantity,
            price: price,
            salePrice: salePrice,
            selectedSize: selectedSize,
            selectedColor: selectedColor
        });
    }

    // The pre-save hook will calculate totalPrice
    await cart.save();
    // Re-populate to return the full product details
    return await cart.populate('items.product');
}

/**
 * Removes a specific item (or a specific variation) from the cart.
 * If quantity in cart drops to 0, the item is removed.
 * @param {string} userId - The ID of the user.
 * @param {string} productId - The ID of the product to remove.
 * @param {string} [selectedSize] - The selected size (optional, for specific variation).
 * @param {string} [selectedColor] - The selected color (optional, for specific variation).
 * @returns {Promise<Cart>} - The updated cart document.
 * @throws {Error} If cart not found.
 */
async function removeItemFromCart(userId, productId, selectedSize = undefined, selectedColor = undefined) {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        throw new Error('Cart not found for this user.');
    }

    // Filter out the item(s) to be removed based on product ID and optional variations
    const initialItemCount = cart.items.length;
    cart.items = cart.items.filter(item => {
        const isMatchingProduct = item.product.toString() === productId;
        const isMatchingSize = selectedSize === undefined || item.selectedSize === selectedSize;
        const isMatchingColor = selectedColor === undefined || item.selectedColor === selectedColor;

        return !(isMatchingProduct && isMatchingSize && isMatchingColor);
    });

    if (cart.items.length === initialItemCount) {
        // This means no item was found matching the criteria
        throw new Error('Item not found in cart with specified variations.');
    }

    // The pre-save hook will recalculate totalPrice
    await cart.save();
    return await cart.populate('items.product');
}

/**
 * Updates the quantity of a specific item in the cart.
 * If newQuantity is 0 or less, the item is removed.
 * @param {string} userId - The ID of the user.
 * @param {string} productId - The ID of the product.
 * @param {number} newQuantity - The new quantity for the item.
 * @param {string} [selectedSize] - The selected size (optional).
 * @param {string} [selectedColor] - The selected color (optional).
 * @returns {Promise<Cart>} - The updated cart document.
 * @throws {Error} If cart or item not found, or not enough stock.
 */
async function updateItemQuantity(userId, productId, newQuantity, selectedSize = undefined, selectedColor = undefined) {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        throw new Error('Cart not found for this user.');
    }

    const itemIndex = cart.items.findIndex(item =>
        item.product.toString() === productId &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );

    if (itemIndex === -1) {
        throw new Error('Item not found in cart.');
    }

    if (newQuantity <= 0) {
        // If quantity is 0 or less, remove the item
        cart.items.splice(itemIndex, 1);
    } else {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found.'); // Should ideally not happen if item is already in cart
        }
        if (product.stockQuantity < newQuantity) {
            throw new Error(`Not enough stock for ${product.name}. Available: ${product.stockQuantity}. Requested: ${newQuantity}`);
        }
        cart.items[itemIndex].quantity = newQuantity;
    }

    await cart.save();
    return await cart.populate('items.product');
}

/**
 * Clears all items from a user's cart.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Cart>} - The updated (empty) cart document.
 * @throws {Error} If cart not found.
 */
async function clearCart(userId) {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        throw new Error('Cart not found for this user.');
    }

    cart.items = [];
    // The pre-save hook will automatically set totalPrice to 0
    await cart.save();
    return cart; // No need to populate an empty cart
}


module.exports = {
    getCartByUserId,
    createCart,
    addItemToCart,
    removeItemFromCart,
    updateItemQuantity,
    clearCart
};
