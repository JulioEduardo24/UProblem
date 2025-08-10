
import express from "express";
const router = express.Router();
import { verificarSesion } from '../middleware/auth.js';
import { createIngreso, getPaysPerMonth, getpaysMethod } from '../controllers/gastoController.js'

router.get('/', verificarSesion, (req, res) => {
    res.render('main/outs');
});
router.post('/ingresos', createIngreso);

router.get('/paysPerMonth', getPaysPerMonth);

router.get('/paysMethod', getpaysMethod);

export default router