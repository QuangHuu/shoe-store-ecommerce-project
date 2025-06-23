const userRepository = require('../repositories/users.repository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // For authentication

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Store in .env
const MAX_LOGIN_ATTEMPTS = 5; // Define the maximum allowed failed attempts before temporary lock
const TEMPORARY_LOCK_TIME = 1 * 60 * 1000; // Temporary lockout duration: 15 minutes in milliseconds
const FAILED_ATTEMPT_RESET_PERIOD = 30 * 60 * 1000; // Reset failed attempts after 30 minutes of inactivity

async function registerUser(userData) {
    try {
        const existingUser = await userRepository.getUserByEmail(userData.email); // check if email has existed
        if (existingUser) {
            throw new Error('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        userData.password = hashedPassword;
        return userRepository.createUser(userData);
    } catch (error) {
        throw new Error('Failed to register user');
    }
}

async function loginUser(email, password) {
    let user = await userRepository.getUserByEmail(email);

    if (!user) {
        // Keep message generic for security
        throw new Error('Invalid credentials');
    }

    // 1. Check for permanent lock first
    if (user.isPermanentlyLocked) {
        throw new Error('Account locked permanently. Please contact admin to unlock your account.');
    }

    // 2. Check for temporary lock expiry
    if (user.lockUntil && user.lockUntil > new Date()) {
        const remainingLockTime = Math.ceil((user.lockUntil.getTime() - new Date().getTime()) / (1000 * 60));
        throw new Error(`Account locked temporarily. Please try again in ${remainingLockTime} minutes.`);
    }

    // 3. Check for failed attempt reset period
    // If there were previous failed attempts AND the last failed attempt was outside the reset window
    if (user.failedLoginAttempts > 0 && user.lastFailedAttemptAt && (new Date() - user.lastFailedAttemptAt) > FAILED_ATTEMPT_RESET_PERIOD) {
        // Reset failed attempts and temporary lock if the window has passed
        user = await userRepository.resetFailedLoginAttempts(user._id);
        // Note: resetFailedLoginAttempts also sets isPermanentlyLocked to false, which is correct here
        // as the permanent lock would have been caught by the check above.
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        // Password is wrong
        user = await userRepository.incrementFailedLoginAttempts(user._id);

        // Logic for applying temporary or permanent lock
        if (user.failedLoginAttempts > MAX_LOGIN_ATTEMPTS) {
            // If failed attempts *exceed* the max, it means they failed even after a potential temporary lock expired,
            // or after the initial temporary lockout. This triggers a permanent lock.
            user = await userRepository.permanentlyLockUser(user._id);
            throw new Error('You have failed too many times. Your account has been permanently locked. Please contact admin to unlock your account.');
        } else if (user.failedLoginAttempts === MAX_LOGIN_ATTEMPTS) {
            // If this is *exactly* the MAX_LOGIN_ATTEMPTS, apply the temporary lock.
            const lockUntilTime = new Date(Date.now() + TEMPORARY_LOCK_TIME);
            user = await userRepository.incrementFailedLoginAttempts(user._id, lockUntilTime); // Set temporary lock
            throw new Error(`Account locked temporarily due to too many failed login attempts. Try again in ${TEMPORARY_LOCK_TIME / (1000 * 60)} minutes.`);
        }
        
        // If failed attempts are less than MAX_LOGIN_ATTEMPTS, just incremented,
        // so return generic error message for invalid credentials.
        throw new Error('Invalid credentials');
    }

    // Password is correct
    // Reset all lockout-related fields on successful login
    if (user.failedLoginAttempts > 0 || user.lockUntil || user.isPermanentlyLocked) {
        user = await userRepository.resetFailedLoginAttempts(user._id);
    }

    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '1h' });
    return { token, user };
}

async function getAllUsers() {
    return userRepository.getAllUsers();
}

async function getUserById(id) {
    return userRepository.getUserById(id);
}

// Existing updateUser function (for regular profile updates)
async function updateUser(id, updateData) {
    try {
        // Check for duplicate email *before* updating
        const existingUserWithEmail = await userRepository.getUserByEmail(updateData.email);

        if (existingUserWithEmail && existingUserWithEmail._id.toString() !== id) {
            throw new Error('Email is already taken');
        }

        // Hash the password if it's being updated
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        // Update the user, excluding the username from updateData
        const safeUpdateData = { ...updateData }; // Create a copy to avoid modifying original
        delete safeUpdateData.username; // Remove username from the copied object

        return await userRepository.updateUser(id, safeUpdateData);
    } catch (error) {
        // Handle the error (e.g., rethrow with a more specific message)
        if (error.message === 'Email is already taken') {
            throw error; // Rethrow the error so the controller can handle it
        } else {
            // Handle other errors (e.g., database connection error)
            throw new Error('Failed to update user'); // Or a more generic error
        }
    }
}

// New function for administrators to change usernames
async function adminChangeUsername(id, newUsername, adminUserId, reason) {
    try {
        // 1. Authorization Check (CRITICAL) - REMOVED from here, done in controller

        // 2. Input Validation (CRITICAL)
        if (!newUsername || newUsername.trim() === '') {
            throw new Error('New username cannot be empty');
        }
        if (!reason || reason.trim() === '') {
            throw new Error('Reason for change is required');
        }

        // 3. Check for Duplicate Username
        const existingUserWithUsername = await userRepository.getUserByUsername(newUsername);
        if (existingUserWithUsername && existingUserWithUsername._id.toString() !== id) {
            throw new Error('Username is already taken');
        }

        // 4. Update the username
        const updatedUser = await userRepository.updateUser(id, { username: newUsername }); // Use the existing updateUser in repo
        if (!updatedUser) {
            throw new Error('User not found');
        }

        // 5. Audit Logging (CRITICAL)
        await userRepository.logUsernameChange(id, newUsername, adminUserId, reason);

        return updatedUser;
    } catch (error) {
        // Handle errors, providing more context where possible
        if (error.message === 'Username is already taken') {
            throw error;
        } else if (error.message === 'User not found') {
            throw error;
        } else {
            throw new Error('Failed to change username: ' + error.message); // Wrap other errors
        }
    }
}

// New function for administrators to update other user information
async function adminUpdateUser(id, updateData, adminUserId) {
    try {
        // 1. Authorization Check (CRITICAL) - REMOVED from here, done in controller

        // 2. Input Validation (Optional, but Recommended) - KEPT here for service-level validation
        //    - You might want to add validation here, depending on your business rules
        //      (e.g., checking email format, phone number format, etc.)

        // 3. Hash the password if it's being updated by an admin
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        const updatedUser = await userRepository.updateUser(id, updateData);
        if (!updatedUser) {
            throw new Error('User not found');
        }

        // 4. Audit Logging (Recommended)
        await userRepository.logAdminUserUpdate(id, updateData, adminUserId);

        return updatedUser;
    } catch (error) {
        // Handle errors
        if (error.message === 'User not found') {
            throw error;
        } else {
            throw new Error('Failed to update user (admin): ' + error.message);
        }
    }
}

async function deleteUser(id) {
    return userRepository.deleteUser(id);
}

/**
 * Unlocks a user's account by resetting failed login attempts, clearing lockUntil, and unsetting permanent lock.
 * This function should only be callable by an administrator.
 * @param {string} userIdToUnlock - The ID of the user whose account is to be unlocked.
 * @param {string} adminUserId - The ID of the administrator performing the unlock.
 * @param {string} [reason] - Optional reason for unlocking the account.
 * @returns {Promise<User>} - The updated user document.
 * @throws {Error} If user not found, or if an error occurs during update.
 */
async function unlockUserAccount(userIdToUnlock, adminUserId, reason) {
    try {
        const userToUnlock = await userRepository.getUserById(userIdToUnlock);
        if (!userToUnlock) {
            throw new Error('User to unlock not found.');
        }

        const updatedUser = await userRepository.resetFailedLoginAttempts(userIdToUnlock);

        // Log the unlock action
        await userRepository.logAccountUnlock(userIdToUnlock, adminUserId, reason);

        return updatedUser;
    } catch (error) {
        console.error('Error in unlockUserAccount service:', error.message);
        throw error; // Re-throw for controller to handle
    }
}


module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    adminChangeUsername,
    adminUpdateUser,
    deleteUser,
    unlockUserAccount
};
