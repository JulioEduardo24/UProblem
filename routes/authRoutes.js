
import express from "express";
const router = express.Router();
import { verificarSesion } from '../middleware/auth.js';
import { formularioLogin, Registrar, Registro, Login, Perfil, VerificiarEmail, VerificiarEmailPage, ConfirmarVerificacion, verificacion_email, ReenviarVerificacion} from '../controllers/authController.js'

router.get('/', formularioLogin);

router.post('/login', Login );
router.get('/register', Registrar);
router.post('/registerUser', Registro );
//router.get('/verificar-email', VerificiarEmail);
// Ruta para mostrar página de verificación
router.get('/verificar-email', VerificiarEmailPage);
// Ruta API para confirmar verificación
router.post('/confirmar-verificacion', ConfirmarVerificacion);
// Cierre de sesión
router.post('/logout', verificarSesion, (req, res) => {
    //console.log('Intentando destruir la sesión'); // Log de depuración
    req.session.destroy((err) => {
        if (err) {
            //console.error('Error al cerrar sesión:', err); // Log del error
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }
        //console.log('Sesión destruida exitosamente'); // Log si todo va bien
        return res.status(200).json({ message: 'Sesión cerrada exitosamente' });
    });
});


router.post('/verify-email', verificacion_email);
router.get('/perfil', verificarSesion, Perfil);
router.post('/reenviar-verificacion', ReenviarVerificacion);
//nueva add
router.post('/reenviar-verificacion2', ReenviarVerificacion);

export default router