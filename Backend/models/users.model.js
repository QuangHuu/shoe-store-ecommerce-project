const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true,
        match: [/^\d{10,15}$/, 'Please fill a valid phone number'] // Basic phone number validation
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    failedLoginAttempts: {
        type: Number,
        required: true,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null // Null if not locked temporarily
    },
    isPermanentlyLocked: {
        type: Boolean,
        required: true,
        default: false // False if not permanently locked
    },
    // --- New field for resetting failed attempts ---
    lastFailedAttemptAt: {
        type: Date,
        default: null // Timestamp of the last failed login attempt
    }
});

// Middleware to update the updatedAt field on save
userSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
