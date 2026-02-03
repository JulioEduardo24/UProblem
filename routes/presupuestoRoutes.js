const express = require('express');
const router = express.Router();
const presupuestoController = require('../controllers/presupuestoController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', presupuestoController.mostrarPresupuestos);
router.get('/nuevo', presupuestoController.mostrarFormularioNuevo);
router.post('/nuevo', presupuestoController.crear);
router.get('/editar/:id', presupuestoController.mostrarFormularioEditar);
router.post('/editar/:id', presupuestoController.actualizar);
router.post('/eliminar/:id', presupuestoController.eliminar);

module.exports = router;