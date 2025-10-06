const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateSignup, validateLogin } = require('../middleware/validationMiddleware');


router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);

router.post('/forgot-username', authController.forgotUsername);
router.post('/forgot-password', authController.forgotPassword);

// Protected routes
router.post('/change-username', authMiddleware, authController.changeUsername);
router.post('/change-password', authMiddleware, authController.changePassword);

// Refresh token endpoint
router.post('/refresh-token', authController.refreshToken);

module.exports = router;
