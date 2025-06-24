const userService = require('../services/users.service');

async function registerUser(req, res) {
    try {
        const user = await userService.registerUser(req.body);
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(400).json({ message: error.message }); // Handle specific errors from service
    }
}

async function loginUser(req, res) {
    try {
        const { token, user } = await userService.loginUser(req.body.email, req.body.password);
        res.json({ token, user });
    } catch (error) {
        // The service layer now provides specific error messages for lockout
        // We'll map these to appropriate HTTP status codes.
        if (error.message.includes('Account locked permanently')) {
            return res.status(403).json({ message: error.message }); // Forbidden
        } else if (error.message.includes('Account locked temporarily')) {
            return res.status(423).json({ message: error.message }); // Locked (WebDAV) - common for temporary lockouts
        } else if (error.message === 'Invalid credentials') {
            return res.status(401).json({ message: error.message }); // Unauthorized
        }
        res.status(500).json({ message: 'Login failed: ' + error.message }); // Generic error for other issues
    }
}

async function getAllUsers(req, res) {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getUserById(req, res) {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function updateUser(req, res, next) {
    try {
        const loggedInUserId = req.user.id; // Get the ID of the logged-in user
        const userIdToUpdate = req.params.id; // Get the ID of the user to update

        // Authorization: Ensure the logged-in user is updating their own profile
        if (loggedInUserId !== userIdToUpdate) {
            return res.status(403).json({ message: 'Unauthorized: You can only update your own profile' }); // Forbidden
        }

        // Construct updateData, EXCLUDING username and isAdmin (should be handled by adminUpdateUser)
        const updateData = {
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            address: req.body.address,
            phoneNumber: req.body.phoneNumber,
            // Only include password if it's provided and needs to be updated
            ...(req.body.password && { password: req.body.password })
            // Add any other fields the user is allowed to update
        };

        const updatedUser = await userService.updateUser(userIdToUpdate, updateData);
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(updatedUser);
    } catch (error) {
        // Handle errors from the service layer
        if (error.message === 'Email is already taken') {
            return res.status(400).json({ message: error.message }); // Bad Request
        } else {
            // Handle other errors (e.g., database error, "Failed to update user")
            return res.status(500).json({ message: 'Failed to update user' }); // Internal Server Error
        }
    }
}

// Controller function for administrators to change usernames
async function adminChangeUsernameController(req, res, next) {
    try {
        const userIdToUpdate = req.params.id;
        const { newUsername, reason } = req.body;
        const adminUserId = req.user.id; // The ID of the logged-in admin

        // 1. Authorization Check (CRITICAL) - Here in controller
        // This assumes req.user is populated by authentication middleware
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized: Admin privileges required' }); // Forbidden
        }

        const updatedUser = await userService.adminChangeUsername(userIdToUpdate, newUsername, adminUserId, reason);
        res.json(updatedUser);
    } catch (error) {
        // Handle errors from the service layer
        if (error.message === 'Unauthorized: Admin privileges required') {
            return res.status(403).json({ message: error.message });
        } else if (error.message === 'Username is already taken') {
            return res.status(400).json({ message: error.message });
        } else if (error.message.includes('User not found')) { // Check for 'User not found' specifically
            return res.status(404).json({ message: error.message });
        } else if (error.message.includes('cannot be empty') || error.message.includes('is required')) {
            return res.status(400).json({ message: error.message }); // Bad Request for validation errors
        } else {
            return res.status(500).json({ message: 'Failed to change username: ' + error.message }); // Internal Server Error
        }
    }
}

// New controller function for administrators to update user information
async function adminUpdateUserController(req, res, next) {
    try {
        const userIdToUpdate = req.params.id;
        const updateData = req.body; // Include ALL data from the request
        const adminUserId = req.user.id;

        // 1. Authorization Check (CRITICAL) - Here in controller
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized: Admin privileges required' });
        }

        const updatedUser = await userService.adminUpdateUser(userIdToUpdate, updateData, adminUserId);
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(updatedUser);
    } catch (error) {
        // Handle errors
        if (error.message === 'Unauthorized: Admin privileges required') {
            return res.status(403).json({ message: error.message });
        } else if (error.message.includes('User not found')) {
            return res.status(404).json({ message: error.message });
        } else {
            return res.status(500).json({ message: 'Failed to update user (admin): ' + error.message });
        }
    }
}

async function deleteUser(req, res) {
    try {
        const deletedUser = await userService.deleteUser(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

/**
 * Controller function for administrators to unlock a user account.
 * Route: POST /api/users/:id/unlock
 * Requires admin authentication.
 */
async function unlockUserAccountController(req, res) {
    try {
        const userIdToUnlock = req.params.id;
        const { reason } = req.body; // Reason for unlocking

        // 1. Authorization Check: Only admins can unlock accounts
        if (!req.user || !req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized: Admin privileges required to unlock accounts' });
        }

        const adminUserId = req.user.id; // ID of the logged-in admin

        // 2. Call the service function to unlock the account
        const unlockedUser = await userService.unlockUserAccount(userIdToUnlock, adminUserId, reason);

        res.json({ message: 'User account unlocked successfully', user: unlockedUser });
    } catch (error) {
        // Handle errors from the service layer
        if (error.message.includes('User to unlock not found')) {
            return res.status(404).json({ message: error.message });
        } else {
            console.error('Error in unlockUserAccountController:', error.message);
            return res.status(500).json({ message: 'Failed to unlock user account: ' + error.message });
        }
    }
}


module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    adminChangeUsernameController,
    adminUpdateUserController,
    deleteUser,
    unlockUserAccountController // Export the new controller function
};
