const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: String }],
    stock: { type: Number, required: true, min: 0 },
    sizes: [
        {
            size: { type: String, required: true, trim: true },
            stock: { type: Number, required: true, min: 0 },
        },
    ],
    colors: [
        {
            color: { type: String, required: true, trim: true },
            images: [{ type: String }],
            stock: { type: Number, required: true, min: 0 },
        },
    ],
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    // Removed subCategory as it's better handled by hierarchical categories
    // --- New Fields for Product Listings ---
    isNewArrival: { // Flag for new products
        type: Boolean,
        default: false,
    },
    isExclusive: { // Flag for exclusive products
        type: Boolean,
        default: false,
    },
    status: { // Product availability status
        type: String,
        enum: ['available', 'coming_soon', 'discontinued'], // Define allowed statuses
        default: 'available',
    },
    onSale: { // Flag if product is on sale
        type: Boolean,
        default: false,
    },
    salePrice: { // Optional sale price
        type: Number,
        min: 0,
        required: function() { return this.onSale === true; } // Required only if onSale is true
    },
    // --- Ratings ---
    ratings: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            rating: { type: Number, required: true, min: 1, max: 5 },
            comment: { type: String }
        },
    ],
    averageRating: { type: Number, default: 0 },
    // --- Comments ---
    comments: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            text: { type: String, required: true, trim: true },
            timestamp: { type: Date, default: Date.now },
        },
    ],
}, {
    timestamps: true,
});

// Middleware to calculate average rating before saving
productSchema.pre('save', function(next) {
    if (this.ratings && this.ratings.length > 0) {
        const totalRating = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
        this.averageRating = totalRating / this.ratings.length;
    } else {
        this.averageRating = 0;
    }
    next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
