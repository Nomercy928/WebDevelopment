const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.server.controllers');
const authenticate = require('../middleware/authenticate');

// Register new user, no authentication required
router.post('/', userController.registerUser);
// User login endpoint
router.post('/login', userController.loginUser);
// Get current authenticated user profile, requires valid session token
router.get('/me', authenticate, userController.getMe);
// Logout current user, clear session token
router.post('/logout', authenticate, userController.logoutUser);

module.exports = router;
