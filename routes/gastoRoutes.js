const express = require('express');
const router = express.Router();
const gastoController = require('../controllers/gastoController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', gastoController.mostrarGastos);
router.get('/nuevo', gastoController.mostrarFormularioNuevo);
router.post('/nuevo', gastoController.crear);
router.post('/sugerir-categoria', gastoController.sugerirCategoria);
router.get('/editar/:id', gastoController.mostrarFormularioEditar);
router.post('/editar/:id', gastoController.actualizar);
router.post('/eliminar/:id', gastoController.eliminar);

module.exports = router;