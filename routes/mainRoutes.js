const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/dashboard', authMiddleware, authController.showDashboard);
router.get('/administrator', authMiddleware, authController.showAdministradorPanel);

module.exports = router;