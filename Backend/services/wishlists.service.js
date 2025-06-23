const wishlistRepository = require('../repositories/wishlists.repository');

/**
 * @file Wishlist Service
 * Handles business logic for wishlist operations.
 */
class WishlistService {
    /**
     * Get or create wishlist for a user.
     * @param {string} userId
     * @param {string[]} [initialProductIds=[]]
     * @returns {Promise<Object>}
     */
    async getOrCreateWishlist(userId, initialProductIds = []) {
        return await wishlistRepository.createOrGetWishlist(userId, initialProductIds);
    }

    /**
     * Retrieve a populated wishlist for a user.
     * @param {string} userId
     * @returns {Promise<Object|null>}
     */
    async getUserWishlist(userId) {
        return await wishlistRepository.getWishlistByUserId(userId);
    }

    /**
     * Add a product to the user's wishlist.
     * @param {string} userId
     * @param {string} productId
     * @returns {Promise<Object>}
     */
    async addProduct(userId, productId) {
        return await wishlistRepository.addProduct(userId, productId);
    }

    /**
     * Remove a product from the user's wishlist.
     * @param {string} userId
     * @param {string} productId
     * @returns {Promise<Object|null>}
     */
    async removeProduct(userId, productId) {
        return await wishlistRepository.removeProduct(userId, productId);
    }

    /**
     * Delete the entire wishlist for a user.
     * @param {string} userId
     * @returns {Promise<Object|null>}
     */
    async deleteWishlist(userId) {
        return await wishlistRepository.deleteWishlist(userId);
    }
}

module.exports = new WishlistService();
