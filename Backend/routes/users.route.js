const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const authenticate = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/isAdmin.middleware');

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Protected routes (require authentication)
router.get('/', authenticate, isAdmin, userController.getAllUsers); // Get all user (admin only)
router.get('/me', authenticate, (req, res) => res.json(req.user)); // Get logged-in user
router.get('/:id', authenticate, userController.getUserById); // Get user by id
router.patch('/:id', authenticate, userController.updateUser); // Update user (regular user update)

// Admin-specific protected routes
router.patch('/:id/username', authenticate, isAdmin, userController.adminChangeUsernameController); // Admin route to change username
router.patch('/admin/:id', authenticate, isAdmin, userController.adminUpdateUserController); // Admin route to update user information (other than username) - FIXED PATH
router.delete('/:id', authenticate, isAdmin, userController.deleteUser); // delete user (admin only)
router.post('/:id/unlock', authenticate, isAdmin, userController.unlockUserAccountController); // Admin route to unlock user account

module.exports = router;