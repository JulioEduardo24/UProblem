
import User from '../models/Auth.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Sequelize } from 'sequelize';
import { sendVerificationEmail } from '../utils/emailService.js';

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

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'El formato del email no es válido.' });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    try {
        // Verificar si el usuario o email ya existe
        const usuarioExistente = await User.findOne({
            where: {
                [Sequelize.Sequelize.Op.or]: [
                    { username },
                    { email }
                ]
            }
        });

        if (usuarioExistente) {
            return res.status(400).json({ error: 'El nombre de usuario o el correo ya están en uso.' });
        }

        // Encriptar la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Generar token de verificación
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

        // Crear nuevo usuario sin verificar
        const nuevoUsuario = await User.create({
            username,
            email,
            password: hashedPassword,
            isVerified: false,
            verificationToken,
            verificationTokenExpires,
        });

        // Enviar email de verificación
        const frontendUrl = req.headers.referer 
            ? req.headers.referer.split('/').slice(0, 3).join('/') 
            : process.env.FRONTEND_URL || 'http://localhost:3000';
        const verificationLink = `${frontendUrl}/auth/verificar-email?token=${verificationToken}`;
        await sendVerificationEmail(email, username, verificationLink);

        return res.status(201).json({
            message: 'Usuario registrado exitosamente. Por favor, verifica tu email para activar tu cuenta.',
            userId: nuevoUsuario.id,
        });

    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'El nombre de usuario o el correo ya están en uso.' });
        }
        return res.status(500).json({ error: 'Error al registrar el usuario.' });
    }
};

// Controlador para verificar email
const VerificiarEmail = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ error: 'Token de verificación no proporcionado.' });
    }

    try {
        const usuario = await User.findOne({
            where: {
                verificationToken: token,
                verificationTokenExpires: {
                    [Sequelize.Sequelize.Op.gt]: new Date() // Token no expirado
                }
            }
        });

        if (!usuario) {
            return res.status(400).json({ error: 'Token inválido o expirado.' });
        }

        // Marcar usuario como verificado
        usuario.isVerified = true;
        usuario.verificationToken = null;
        usuario.verificationTokenExpires = null;
        await usuario.save();

        return res.status(200).json({ message: 'Email verificado exitosamente. Puedes iniciar sesión.' });

    } catch (error) {
        console.error('Error al verificar email:', error);
        return res.status(500).json({ error: 'Error al verificar el email.' });
    }
};

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

        req.session.isLoggedIn = true;
        req.session.userId = usuario.id;
        req.session.username = usuario.username;
        return res.status(200).json({ message: 'Inicio de sesión exitoso' });
    } catch (error) {
        return res.status(500).json({ error: 'Error al iniciar sesión' });
    }
}

const Perfil = async (req, res) => {
    const username = req.session.username; 

    if (!username) {
        return res.status(400).json({ error: 'No se encontró el correo en la sesión' });
    }

    return res.status(200).json({ email: username, message: 'Perfil de usuario' });
}


const VerificiarEmailPage = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.render('verify-email', { 
            status: 'error', 
            message: 'Token de verificación no proporcionado.',
            token: null
        });
    }

    try {
        const usuario = await User.findOne({
            where: {
                verificationToken: token,
                verificationTokenExpires: {
                    [Sequelize.Op.gt]: new Date()
                }
            }
        });

        if (!usuario) {
            return res.render('verify-email', { 
                status: 'error', 
                message: 'Token inválido o expirado.',
                token: null
            });
        }

        // Mostrar página con token válido
        return res.render('verify-email', { 
            status: 'pending', 
            message: 'Haz clic en el botón para verificar tu email',
            token: token
        });

    } catch (error) {
        console.error('Error al verificar email:', error);
        return res.render('verify-email', { 
            status: 'error', 
            message: 'Error al procesar la verificación',
            token: null
        });
    }
};

// API para confirmar la verificación
const ConfirmarVerificacion = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token no proporcionado.' });
    }

    try {
        const usuario = await User.findOne({
            where: {
                verificationToken: token,
                verificationTokenExpires: {
                    [Sequelize.Op.gt]: new Date()
                }
            }
        });

        if (!usuario) {
            return res.status(400).json({ error: 'Token inválido o expirado.' });
        }

        // Marcar usuario como verificado
        usuario.isVerified = true;
        usuario.verificationToken = null;
        usuario.verificationTokenExpires = null;
        await usuario.save();

        return res.status(200).json({ 
            message: 'Email verificado exitosamente. Redirigiendo...' 
        });

    } catch (error) {
        console.error('Error al verificar email:', error);
        return res.status(500).json({ error: 'Error al verificar el email.' });
    }
};

export {
    formularioLogin,
    Registro,
    Login,
    Perfil,
    Registrar,
    VerificiarEmail,
    VerificiarEmailPage,
    ConfirmarVerificacion
}