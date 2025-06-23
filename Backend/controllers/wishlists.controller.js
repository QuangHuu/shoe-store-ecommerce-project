const wishlistService = require('../services/wishlists.service');

/**
 * Controller for Wishlist Operations
 * Handles HTTP requests and responses.
 */

// GET /api/wishlist/:userId
const getWishlist = async (req, res) => {
    try {
        const userId = req.params.userId;
        const wishlist = await wishlistService.getUserWishlist(userId);
        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }
        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/wishlist/:userId
const createWishlist = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { productIds = [] } = req.body;
        const wishlist = await wishlistService.getOrCreateWishlist(userId, productIds);
        res.status(201).json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/wishlist/:userId/add
const addProductToWishlist = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        const wishlist = await wishlistService.addProduct(userId, productId);
        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/wishlist/:userId/remove
const removeProductFromWishlist = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        const wishlist = await wishlistService.removeProduct(userId, productId);
        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/wishlist/:userId
const deleteWishlist = async (req, res) => {
    try {
        const userId = req.params.userId;
        const result = await wishlistService.deleteWishlist(userId);

        if (!result) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        res.json({ message: 'Wishlist deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getWishlist,
    createWishlist,
    addProductToWishlist,
    removeProductFromWishlist,
    deleteWishlist,
};
