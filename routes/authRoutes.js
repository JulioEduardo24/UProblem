
import express from "express";
const router = express.Router();
import { verificarSesion } from '../middleware/auth.js';
import { formularioLogin, Registrar, Registro, Login, Perfil} from '../controllers/authController.js'

router.get('/', formularioLogin);

router.post('/login', Login );
router.get('/register', Registrar);
router.post('/register', Registro );

// Cierre de sesión
router.post('/logout', verificarSesion, (req, res) => {
    console.log('Intentando destruir la sesión'); // Log de depuración
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err); // Log del error
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }
        console.log('Sesión destruida exitosamente'); // Log si todo va bien
        return res.status(200).json({ message: 'Sesión cerrada exitosamente' });
    });
});


router.get('/perfil', verificarSesion, Perfil);

export default router