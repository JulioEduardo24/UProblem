const express = require('express');
const router = express.Router();
const presupuestoController = require('../controllers/presupuestoController');
const { authMiddleware, isAdmin, isUser } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', isUser, presupuestoController.mostrarPresupuestos);
router.get('/nuevo', isUser, presupuestoController.mostrarFormularioNuevo);
router.post('/nuevo', isUser, presupuestoController.crear);
router.get('/editar/:id', isUser, presupuestoController.mostrarFormularioEditar);
router.post('/editar/:id', isUser, presupuestoController.actualizar);
router.post('/eliminar/:id', isUser, presupuestoController.eliminar);

module.exports = router;