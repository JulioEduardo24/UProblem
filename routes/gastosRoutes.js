
import express from "express";
const router = express.Router();
import { verificarSesion } from '../middleware/auth.js';
import { createIngreso, getpaysMethod, EgresosTarjetaPerUsuario } from '../controllers/gastoController.js'

router.get('/', verificarSesion, (req, res) => {
    res.render('main/outs');
});
router.post('/ingresos', createIngreso);

router.get('/paysMethod', getpaysMethod);

router.post('/EgresosTarjetaPerUsuario', EgresosTarjetaPerUsuario);

export default router