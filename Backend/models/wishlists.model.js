const mongoose = require('mongoose');

/**
 * @fileoverview Mongoose model for Wishlist.
 * Defines the schema for a user's wishlist, allowing them to save products.
 */

const wishlistSchema = new mongoose.Schema({
    /**
     * @property {mongoose.Schema.Types.ObjectId} user - The ID of the user who owns this wishlist.
     * This field is required and uniquely identifies the user associated with the wishlist.
     * It references the 'User' model, establishing a relationship between a wishlist and a user.
     * Assumes a 'User' model exists in your application.
     */
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true,
        unique: true, // Ensures one wishlist per user. Remove if multiple wishlists per user are desired.
    },
    /**
     * @property {Array<mongoose.Schema.Types.ObjectId>} products - An array of product IDs in the wishlist.
     * Each element in this array is an ObjectId referencing a product.
     * This allows a user to have multiple products in their wishlist.
     * It references the 'Product' model, establishing a relationship between a wishlist and products.
     * Products can be added or removed from this array.
     */
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', // Reference to the Product model
        }
    ],
    /**
     * @property {String} name - An optional name for the wishlist.
     * This allows users to name their wishlists (e.g., "My Favorites", "Birthday Gifts").
     * If not provided, a default name could be set in the application logic.
     */
    name: {
        type: String,
        trim: true,
        default: 'My Wishlist', // A default name if none is provided
    },
}, {
    /**
     * @property {Object} timestamps - Mongoose schema option to automatically add createdAt and updatedAt fields.
     * `createdAt`: A Date representing when the document was first created.
     * `updatedAt`: A Date representing the last time the document was updated.
     */
    timestamps: true,
});

// Create the Mongoose model from the schema
const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;

