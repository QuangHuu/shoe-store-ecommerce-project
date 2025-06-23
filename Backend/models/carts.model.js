const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: { // Price at the time of adding to cart
        type: Number,
        required: true
    },
    salePrice: { // Sale price at the time of adding to cart (if applicable)
        type: Number
    },
    // Optional: Fields for product variations if your products have them
    selectedSize: {
        type: String
    },
    selectedColor: {
        type: String
    }
}, { _id: false }); // _id: false means Mongoose won't automatically generate an _id for each cart item subdocument

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Ensures one cart per user
    },
    items: [cartItemSchema], // Array of products in the cart
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

// Pre-save hook to calculate total price before saving
cartSchema.pre('save', function(next) {
    let total = 0;
    this.items.forEach(item => {
        // Use salePrice if available, otherwise use regular price
        const effectivePrice = item.salePrice !== undefined && item.salePrice < item.price ? item.salePrice : item.price;
        total += effectivePrice * item.quantity;
    });
    this.totalPrice = total;
    next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
