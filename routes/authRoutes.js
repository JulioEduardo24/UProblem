
import express from "express";
const router = express.Router();
import { verificarSesion } from '../middleware/auth.js';
import { formularioLogin, Registro, Login, Perfil} from '../controllers/authController.js'

router.get('/', formularioLogin);

router.post('/login', Login );
router.post('/register', Registro );

// Cierre de sesión
router.post('/logout', verificarSesion, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }
        res.status(200).json({ message: 'Sesión cerrada exitosamente' });
    });
});

router.get('/perfil', verificarSesion, Perfil);

export default router