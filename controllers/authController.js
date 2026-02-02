const Auth = require('../models/Auth');
const jwt = require('jsonwebtoken');

exports.showRegister = (req, res) => {
  res.render('auth/register', { error: null });
};

exports.showLogin = (req, res) => {
  const registered = req.query.registered === 'true';
  res.render('auth/login', { 
    error: null,
    success: registered ? 'Cuenta creada exitosamente. Inicia sesión.' : null
  });
};

exports.register = async (req, res) => {
  try {
    const { 
      nombres, apellidos, fecha_nacimiento, sexo, usuario, correo, 
      password, confirmPassword, tipo_documento, numero_documento, telefono 
    } = req.body;

    if (!nombres || !apellidos || !fecha_nacimiento || !sexo || !usuario || 
        !correo || !password || !tipo_documento || !numero_documento) {
      return res.render('auth/register', { 
        error: 'Todos los campos obligatorios deben completarse' 
      });
    }

    if (password !== confirmPassword) {
      return res.render('auth/register', { 
        error: 'Las contraseñas no coinciden' 
      });
    }

    if (password.length < 8) {
      return res.render('auth/register', { 
        error: 'La contraseña debe tener al menos 8 caracteres' 
      });
    }

    if (usuario.length < 4) {
      return res.render('auth/register', { 
        error: 'El usuario debe tener al menos 4 caracteres' 
      });
    }

    const fechaNac = new Date(fecha_nacimiento);
    const edad = Math.floor((new Date() - fechaNac) / (365.25 * 24 * 60 * 60 * 1000));
    if (edad < 18) {
      return res.render('auth/register', { 
        error: 'Debes ser mayor de 18 años' 
      });
    }

    const existingEmail = await Auth.findByEmail(correo);
    if (existingEmail) {
      return res.render('auth/register', { 
        error: 'El correo ya está registrado' 
      });
    }

    const existingUsername = await Auth.findByUsername(usuario);
    if (existingUsername) {
      return res.render('auth/register', { 
        error: 'El nombre de usuario ya está en uso' 
      });
    }

    const existingDocument = await Auth.findByDocument(numero_documento);
    if (existingDocument) {
      return res.render('auth/register', { 
        error: 'El número de documento ya está registrado' 
      });
    }

    await Auth.createUser({
      nombres, apellidos, fecha_nacimiento, sexo, usuario, correo,
      password, tipo_documento, numero_documento, telefono
    });

    res.redirect('/auth/login?registered=true');

  } catch (error) {
    console.error('Error en registro:', error);
    res.render('auth/register', { 
      error: 'Error al crear la cuenta. Intenta nuevamente.' 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.render('auth/login', { 
        error: 'Usuario/Correo y contraseña son obligatorios',
        success: null
      });
    }

    const user = await Auth.findByEmailOrUsername(identifier);
    if (!user) {
      return res.render('auth/login', { 
        error: 'Credenciales incorrectas',
        success: null
      });
    }

    const isValidPassword = await Auth.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.render('auth/login', { 
        error: 'Credenciales incorrectas',
        success: null
      });
    }

    const token = jwt.sign(
      { 
        userId: user.id,
        nombres: user.nombres,
        apellidos: user.apellidos
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.cookie('theme', user.tema_preferido || 'light', {
      maxAge: 365 * 24 * 60 * 60 * 1000
    });

    res.redirect('/dashboard');

  } catch (error) {
    console.error('Error en login:', error);
    res.render('auth/login', { 
      error: 'Error al iniciar sesión. Intenta nuevamente.',
      success: null
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/auth/login');
};

exports.showDashboard = async (req, res) => {
  try {
    const user = await Auth.findById(req.userId);
    res.render('main/dashboard', { user });
  } catch (error) {
    console.error('Error al cargar dashboard:', error);
    res.redirect('/auth/login');
  }
};

exports.toggleTheme = async (req, res) => {
  try {
    const { theme } = req.body;
    await Auth.updateTheme(req.userId, theme);
    res.cookie('theme', theme, {
      maxAge: 365 * 24 * 60 * 60 * 1000
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};