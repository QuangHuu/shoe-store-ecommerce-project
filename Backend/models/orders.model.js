const mongoose = require('mongoose');

// Schema for individual items within an order
const orderItemSchema = new mongoose.Schema({
    productId: { // Reference to the actual product in the Product collection
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    // --- Snapshot of product details at the time of order ---
    name: { // Product name snapshot
        type: String,
        required: true
    },
    price: { // Unit price snapshot (original price)
        type: Number,
        required: true,
        min: 0
    },
    salePrice: { // Unit sale price snapshot (if applicable)
        type: Number,
        min: 0,
        default: null // Use null if not on sale
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    selectedSize: { // Selected size snapshot
        type: String,
        trim: true
    },
    selectedColor: { // Selected color snapshot
        type: String,
        trim: true
    },
    imageUrl: { // Primary image URL snapshot for display in order history
        type: String,
        trim: true
    }
}, { _id: false }); // _id: false means Mongoose won't automatically generate an _id for each order item subdocument

// Schema for the shipping address
const shippingAddressSchema = new mongoose.Schema({
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    // You might add firstName, lastName, phoneNumber here if different from user's profile
}, { _id: false });

// Main Order Schema
const orderSchema = new mongoose.Schema({
    user: { // Reference to the user who placed the order
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema], // Array of products in the order
    totalAmount: { // Total cost of the order
        type: Number,
        required: true,
        min: 0
    },
    shippingAddress: { // Embedded shipping address details
        type: shippingAddressSchema,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery'] // Define allowed payment methods
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'paid', 'failed', 'refunded'], // Current payment status
        default: 'pending'
    },
    orderStatus: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'], // Current order fulfillment status
        default: 'pending'
    },
    trackingNumber: { // Optional tracking number for shipped orders
        type: String,
        trim: true,
        default: null
    },
    // Might add fields like:
    // shippingCost: { type: Number, default: 0 },
    // taxAmount: { type: Number, default: 0 },
    // discountAmount: { type: Number, default: 0 },
}, {
    timestamps: true // Adds createdAt (orderedAt) and updatedAt fields
});

// Pre-save hook to calculate total amount before saving
orderSchema.pre('save', function(next) {
    let total = 0;
    this.items.forEach(item => {
        // Use salePrice if available and lower than regular price, otherwise use regular price
        const effectivePrice = (item.salePrice !== null && item.salePrice < item.price) ? item.salePrice : item.price;
        total += effectivePrice * item.quantity;
    });
    this.totalAmount = total;
    next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
