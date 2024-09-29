
import express from "express";
const router = express.Router();
import { verificarSesion } from '../middleware/auth.js';
import { createIngreso } from '../controllers/gastoController.js'

// Ruta para la página principal (vista con el formulario)
/*router.get('/', (req, res) => {
    res.render('index');
});*/
router.get('/', verificarSesion, (req, res) => {
    res.render('index');
});
router.post('/ingresos', createIngreso);

export default router