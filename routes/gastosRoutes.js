
import express from "express";
const router = express.Router();
import { verificarSesion } from '../middleware/auth.js';
import { createIngreso } from '../controllers/gastoController.js'

router.get('/', verificarSesion, (req, res) => {
    res.render('outs/outs');
});
router.post('/ingresos', createIngreso);

export default router