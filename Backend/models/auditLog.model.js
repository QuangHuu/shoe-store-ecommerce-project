const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference the User model
        required: true,
    },
    action: {
        type: String,
        required: true,
        // Add 'ACCOUNT_UNLOCK' to the enum list
        enum: ['USERNAME_CHANGE', 'ADMIN_USER_UPDATE', 'USER_UPDATE', 'USER_DELETE', 'USER_CREATE', 'USER_LOGIN', 'USER_LOGOUT', 'ACCOUNT_UNLOCK'], // Enum for action types
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true,
    },
    updatedFields: { // For ADMIN_USER_UPDATE
        type: mongoose.Schema.Types.Mixed, // Store updated fields as an object
    },
    newUsername: { // For USERNAME_CHANGE
        type: String,
    },
    reason: { // For USERNAME_CHANGE (and can be reused for other admin actions if applicable)
        type: String,
    },
    adminUserId: {  // ID of the admin performing the action
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference the User model
    },
    description: { // general description, used for ACCOUNT_UNLOCK
        type: String
    }

});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
