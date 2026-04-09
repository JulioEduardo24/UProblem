const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, isAdmin, isUser } = require('../middleware/authMiddleware');

router.get('/dashboard', isUser, authController.showDashboard);
router.get('/administrator', isAdmin, authController.showAdministradorPanel);

module.exports = router;