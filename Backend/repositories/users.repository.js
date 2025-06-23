const User = require('../models/users.model');
const AuditLog = require('../models/auditLog.model'); // Import your AuditLog model

async function createUser(userData) {
    const user = new User(userData);
    return user.save();
}

async function getAllUsers() {
    return User.find().exec();
}

async function getUserById(id) {
    return User.findById(id).exec();
}

async function getUserByEmail(email) {
    return User.findOne({ email }).exec();
}

async function getUserByUsername(username) {
    return User.findOne({ username }).exec();
}

async function updateUser(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
}

async function deleteUser(id) {
    return User.findByIdAndDelete(id).exec();
}

/**
 * Resets failed login attempts, clears temporary lock, and unsets permanent lock.
 * This is used for successful logins or admin unlocks.
 * Also resets lastFailedAttemptAt.
 * @param {string} userId - The ID of the user to update.
 * @returns {Promise<User>} The updated user document.
 */
async function resetFailedLoginAttempts(userId) {
    return User.findByIdAndUpdate(
        userId,
        { $set: { failedLoginAttempts: 0, lockUntil: null, isPermanentlyLocked: false, lastFailedAttemptAt: null } },
        { new: true }
    ).exec();
}

/**
 * Increments failed login attempts and sets lastFailedAttemptAt.
 * Optionally sets a temporary lockUntil time.
 * @param {string} userId - The ID of the user to update.
 * @param {Date | null} [lockUntilTime=null] - The timestamp until which the account is temporarily locked. Null if not setting/clearing temporary lock.
 * @returns {Promise<User>} The updated user document.
 */
async function incrementFailedLoginAttempts(userId, lockUntilTime = null) {
    const update = {
        $inc: { failedLoginAttempts: 1 }, // Increment by 1
        $set: { lastFailedAttemptAt: new Date() } // Update last failed attempt timestamp
    };
    if (lockUntilTime !== null) {
        update.$set.lockUntil = lockUntilTime; // Set lockUntil if provided
    }

    return User.findByIdAndUpdate(userId, update, { new: true }).exec();
}

/**
 * Sets a user account to be permanently locked.
 * Also resets failed attempts and clears temporary lock.
 * @param {string} userId - The ID of the user to permanently lock.
 * @returns {Promise<User>} The updated user document.
 */
async function permanentlyLockUser(userId) {
    return User.findByIdAndUpdate(
        userId,
        { $set: { isPermanentlyLocked: true, lockUntil: null, failedLoginAttempts: 0, lastFailedAttemptAt: null } }, // Clear temp lock and attempts
        { new: true }
    ).exec();
}


// New function for logging admin user updates
async function logAdminUserUpdate(userId, updateData, adminUserId) {
    const auditLog = new AuditLog({
        userId: userId,
        action: 'ADMIN_USER_UPDATE',
        timestamp: new Date(),
        updatedFields: updateData,
        adminUserId: adminUserId,
    });
    await auditLog.save();
}

// New function for logging username changes
async function logUsernameChange(userId, newUsername, adminUserId, reason) {
    const auditLog = new AuditLog({
        userId: userId,
        action: 'USERNAME_CHANGE',
        timestamp: new Date(),
        newUsername: newUsername,
        reason: reason,
        adminUserId: adminUserId,
    });
    await auditLog.save();
}

// New function for logging account unlock
async function logAccountUnlock(userId, adminUserId, reason) {
    const auditLog = new AuditLog({
        userId: userId,
        action: 'ACCOUNT_UNLOCK',
        timestamp: new Date(),
        adminUserId: adminUserId,
        description: `Account unlocked by admin. Reason: ${reason || 'No reason provided.'}`
    });
    await auditLog.save();
}


module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    getUserByEmail,
    getUserByUsername,
    updateUser,
    deleteUser,
    resetFailedLoginAttempts,
    incrementFailedLoginAttempts,
    permanentlyLockUser,
    logAdminUserUpdate,
    logUsernameChange,
    logAccountUnlock
};
