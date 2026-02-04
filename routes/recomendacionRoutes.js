const express = require('express');
const router = express.Router();
const recomendacionController = require('../controllers/recomendacionController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', recomendacionController.mostrarRecomendaciones);
router.get('/api', recomendacionController.obtenerRecomendacionesJson);

module.exports = router;