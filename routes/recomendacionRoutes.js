const express = require('express');
const router = express.Router();
const recomendacionController = require('../controllers/recomendacionController');
const { authMiddleware, isAdmin, isUser } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', isUser, recomendacionController.mostrarRecomendaciones);
router.get('/api', isUser, recomendacionController.obtenerRecomendacionesJson);

module.exports = router;