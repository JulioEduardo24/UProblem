
import User from '../models/Auth.js';
import bcrypt from 'bcrypt';

const formularioLogin = (req, res) => {
    res.render('auth/login')
}

const Registrar = (req, res) => {
    res.render('auth/register')
}

const Registro = async (req, res) => {
    const { username, email, password } = req.body;

    // Validar campos requeridos
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
        // Encriptar la contraseña
        const saltRounds = 10; // Número de rondas de sal
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // Crear un nuevo usuario con la contraseña encriptada
        const nuevoUsuario = await User.create({
            username,
            email,
            password: hashedPassword, // Guardar la contraseña encriptada
        });
        return res.status(201).json(nuevoUsuario);
    } catch (error) {
        //console.error('Error al registrar el usuario:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'El nombre de usuario o el correo ya están en uso.' });
        }
        return res.status(500).json({ error: 'Error al registrar el usuario.' });
    }
}

const Login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const usuario = await User.findOne({ where: { email } });

        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const isPasswordValid = await bcrypt.compare(password, usuario.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // Establecer sesión
        req.session.isLoggedIn = true;
        req.session.userId = usuario.id;
        req.session.userEmail = usuario.email;
        return res.status(200).json({ message: 'Inicio de sesión exitoso' });
    } catch (error) {
        return res.status(500).json({ error: 'Error al iniciar sesión' });
    }
}


const Perfil = async (req, res) => {
    const userEmail = req.session.userEmail;  // Acceder al correo desde la sesión

    if (!userEmail) {
        return res.status(400).json({ error: 'No se encontró el correo en la sesión' });
    }

    return res.status(200).json({ email: userEmail, message: 'Perfil de usuario' });
}

export {
    formularioLogin,
    Registro,
    Login,
    Perfil,
    Registrar
}