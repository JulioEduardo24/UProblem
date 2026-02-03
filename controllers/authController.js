const Auth = require('../models/Auth');
const jwt = require('jsonwebtoken');
const Gasto = require('../models/Gasto');
const Presupuesto = require('../models/Presupuesto');


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
    
    // Obtener fecha actual
    const hoy = new Date();
    const mes = hoy.getMonth() + 1;
    const anio = hoy.getFullYear();

    // Obtener total gastado del mes
    const totalMensual = await Gasto.obtenerTotalMensual(req.userId, mes, anio);

    // Obtener resumen por categoría
    const resumenCategorias = await Gasto.obtenerResumenPorCategoria(req.userId, mes, anio);

    // Obtener presupuesto actual
    const presupuestoActual = await Presupuesto.obtenerActual(req.userId, mes, anio);
    
    let progresoPresupuesto = null;
    if (presupuestoActual) {
      progresoPresupuesto = await Presupuesto.calcularProgreso(req.userId, mes, anio);
    }

    // Obtener gastos recientes (últimos 10)
    const gastosRecientes = await Gasto.obtenerPorUsuario(req.userId, {});
    const ultimos10 = gastosRecientes.slice(0, 10);

    // Calcular estadísticas
    const estadisticas = {
      totalMensual,
      presupuesto: presupuestoActual ? parseFloat(presupuestoActual.monto_total) : 0,
      porcentajeGastado: presupuestoActual ? (totalMensual / parseFloat(presupuestoActual.monto_total)) * 100 : 0,
      ahorro: presupuestoActual ? parseFloat(presupuestoActual.monto_total) - totalMensual : 0,
      categoriaConMasGasto: obtenerCategoriaConMasGasto(resumenCategorias),
      totalGastos: gastosRecientes.length
    };

    // Preparar datos para gráficos
    const datosGraficos = {
      categorias: Object.keys(resumenCategorias),
      montos: Object.values(resumenCategorias),
      colores: obtenerColoresCategorias(Object.keys(resumenCategorias))
    };

    res.render('main/dashboard', {
      user,
      estadisticas,
      resumenCategorias,
      datosGraficos,
      progresoPresupuesto,
      presupuestoActual,
      ultimos10,
      mes,
      anio
    });
  } catch (error) {
    console.error('Error al cargar dashboard:', error);
    res.redirect('/auth/login');
  }
};

function obtenerCategoriaConMasGasto(resumen) {
  if (Object.keys(resumen).length === 0) return 'N/A';
  
  let maxCategoria = '';
  let maxMonto = 0;
  
  Object.entries(resumen).forEach(([categoria, monto]) => {
    if (monto > maxMonto) {
      maxMonto = monto;
      maxCategoria = categoria;
    }
  });
  
  return maxCategoria;
}

function obtenerColoresCategorias(categorias) {
  const coloresMap = {
    'Alimentación': '#10b981',
    'Transporte': '#3b82f6',
    'Vivienda': '#f59e0b',
    'Salud': '#ec4899',
    'Entretenimiento': '#8b5cf6',
    'Educación': '#06b6d4',
    'Ropa y Cuidado Personal': '#f43f5e',
    'Otros': '#6b7280'
  };
  
  return categorias.map(cat => coloresMap[cat] || '#6b7280');
}

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