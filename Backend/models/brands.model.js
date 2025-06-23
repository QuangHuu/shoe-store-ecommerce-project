const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // Ensure brand names are unique
        trim: true,       // Remove leading/trailing spaces
    },
    description: {
        type: String,
        required: false, // Description is optional
    },
    logoUrl: { // URL to the brand's logo
        type: String,
        required: false,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set creation date
    },
    updatedAt: {
        type: Date,
        default: Date.now, // Automatically set update date
    },
});

// Middleware to update the updatedAt field on save
brandSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;
