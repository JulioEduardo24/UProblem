const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { redirectIfAuthenticated, authMiddleware } = require('../middleware/authMiddleware');

router.get('/register', redirectIfAuthenticated, authController.showRegister);
router.post('/register', redirectIfAuthenticated, authController.register);

router.get('/login', redirectIfAuthenticated, authController.showLogin);
router.post('/login', redirectIfAuthenticated, authController.login);

router.get('/logout', authController.logout);

router.post('/toggle-theme', authMiddleware, authController.toggleTheme);

module.exports = router;