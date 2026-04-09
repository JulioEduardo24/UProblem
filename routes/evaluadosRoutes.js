const express = require('express');
const router = express.Router();
const evaluacionesController = require('../controllers/evaluadosController');
const { isAdmin } = require('../middleware/authMiddleware');

// Todas las rutas requieren ser administrador
router.use(isAdmin);

/**
 * GET /evaluaciones
 * Panel principal con pre-test de Dimensión 1
 */
router.get('/', evaluacionesController.mostrarPanel);

/**
 * GET /evaluaciones/exportar/1
 * Exportar datos pre-test en CSV
 */
router.get('/exportar/1', evaluacionesController.exportarPretest);

module.exports = router;