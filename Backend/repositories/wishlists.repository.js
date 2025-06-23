const Wishlist = require('../models/wishlists.model'); // Adjust path as per your project structure

/**
 * @fileoverview Repository for Wishlist operations.
 * This module provides an abstraction layer for interacting with the Wishlist Mongoose model,
 * encapsulating database operations related to wishlists.
 */

class WishlistRepository {

    /**
     * Creates a new wishlist for a given user.
     * If a wishlist already exists for the user, it returns the existing one.
     *
     * @param {string} userId - The ID of the user for whom to create the wishlist.
     * @param {Array<string>} [productIds=[]] - An optional array of product IDs to initially add to the wishlist.
     * @returns {Promise<Object>} The created or existing wishlist document.
     */
    async createWishlist(userId, productIds = []) {
        try {
            let wishlist = await Wishlist.findOne({ user: userId });

            if (wishlist) {
                productIds.forEach(productId => {
                    if (!wishlist.products.includes(productId)) {
                        wishlist.products.push(productId);
                    }
                });
                await wishlist.save();
                return wishlist;
            } else {
                wishlist = await Wishlist.create({
                    user: userId,
                    products: productIds,
                });
                return wishlist;
            }
        } catch (error) {
            console.error(`Error creating or fetching wishlist for user ${userId}:`, error);
            throw new Error(`Failed to create or fetch wishlist: ${error.message}`);
        }
    }

    /**
     * Retrieves a wishlist by user ID, populating the product and user details.
     *
     * @param {string} userId - The ID of the user whose wishlist to retrieve.
     * @returns {Promise<Object|null>} The wishlist document with populated products and user, or null if not found.
     */
    async getWishlistByUserId(userId) {
        try {
            const wishlist = await Wishlist.findOne({ user: userId })
                .populate('products')
                .populate('user');
            return wishlist;
        } catch (error) {
            console.error(`Error retrieving wishlist for user ${userId}:`, error);
            throw new Error(`Failed to retrieve wishlist: ${error.message}`);
        }
    }

    /**
     * Adds a product to a user's wishlist.
     * If the product is already in the wishlist, it does nothing.
     * If the wishlist doesn't exist, it creates one.
     *
     * @param {string} userId - The ID of the user whose wishlist to update.
     * @param {string} productId - The ID of the product to add.
     * @returns {Promise<Object>} The updated or newly created wishlist document.
     */
    async addProductToWishlist(userId, productId) {
        try {
            let wishlist = await Wishlist.findOne({ user: userId });

            if (!wishlist) {
                // Automatically create wishlist if not exists
                wishlist = await Wishlist.create({
                    user: userId,
                    products: [productId],
                });
                return wishlist;
            }

            if (!wishlist.products.includes(productId)) {
                wishlist.products.push(productId);
                await wishlist.save();
            }

            return wishlist;
        } catch (error) {
            console.error(`Error adding product ${productId} to wishlist for user ${userId}:`, error);
            throw new Error(`Failed to add product to wishlist: ${error.message}`);
        }
    }

    /**
     * Removes a product from a user's wishlist.
     *
     * @param {string} userId - The ID of the user whose wishlist to update.
     * @param {string} productId - The ID of the product to remove.
     * @returns {Promise<Object|null>} The updated wishlist document, or null if not found.
     */
    async removeProductFromWishlist(userId, productId) {
        try {
            const wishlist = await Wishlist.findOne({ user: userId });

            if (!wishlist) return null;

            wishlist.products = wishlist.products.filter(
                (pId) => pId.toString() !== productId.toString()
            );
            await wishlist.save();
            return wishlist;
        } catch (error) {
            console.error(`Error removing product ${productId} from wishlist for user ${userId}:`, error);
            throw new Error(`Failed to remove product from wishlist: ${error.message}`);
        }
    }

    /**
     * Deletes a user's entire wishlist.
     *
     * @param {string} userId - The ID of the user whose wishlist to delete.
     * @returns {Promise<Object|null>} The deleted wishlist document, or null if not found.
     */
    async deleteWishlist(userId) {
        try {
            return await Wishlist.findOneAndDelete({ user: userId });
        } catch (error) {
            console.error(`Error deleting wishlist for user ${userId}:`, error);
            throw new Error(`Failed to delete wishlist: ${error.message}`);
        }
    }
}

module.exports = new WishlistRepository();
