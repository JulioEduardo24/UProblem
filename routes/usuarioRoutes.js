const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', usuarioController.mostrarPerfil);
router.post('/actualizar', usuarioController.actualizarPerfil);
router.post('/cambiar-password', usuarioController.cambiarPassword);

module.exports = router;