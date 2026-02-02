const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/dashboard', authMiddleware, authController.showDashboard);

module.exports = router;