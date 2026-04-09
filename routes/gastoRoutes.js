const express = require('express');
const router = express.Router();
const gastoController = require('../controllers/gastoController');
const { authMiddleware, isAdmin, isUser } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', isUser, gastoController.mostrarGastos);
router.get('/nuevo', isUser, gastoController.mostrarFormularioNuevo);
router.post('/nuevo', isUser, gastoController.crear);
router.post('/sugerir-categoria', isUser, gastoController.sugerirCategoria);
router.get('/editar/:id', isUser, gastoController.mostrarFormularioEditar);
router.post('/editar/:id', isUser, gastoController.actualizar);
router.post('/eliminar/:id', isUser, gastoController.eliminar);

router.get('/exportar/pdf', isUser, gastoController.exportarPDF);
router.get('/exportar/excel', isUser, gastoController.exportarExcel);


module.exports = router;