const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación - Verifica que el usuario esté logueado
 * Permite acceso a CUALQUIER usuario autenticado (rol '1' o '2')
 */
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userName = decoded.nombres;
    req.rol = decoded.rol;
    next();
  } catch (error) {
    res.clearCookie('token');
    return res.redirect('/auth/login');
  }
};

const isAdmin = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userName = decoded.nombres;
    req.rol = decoded.rol;

    if (decoded.rol !== 2) {
      if (decoded.rol === 1) {
        return res.redirect('/dashboard');
      }
      return res.redirect('/auth/login');
    }

    next();
  } catch (error) {
    res.clearCookie('token');
    return res.redirect('/auth/login');
  }
};

const isUser = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userName = decoded.nombres;
    req.rol = decoded.rol;

    if (decoded.rol !== 1) {
      if (decoded.rol === 2) {
        return res.redirect('/administrator');
      }
      return res.redirect('/auth/login');
    }

    next();
  } catch (error) {
    res.clearCookie('token');
    return res.redirect('/auth/login');
  }
};

/**
 * Middleware de redirección - Redirige según rol si ya está autenticado
 */
const redirectIfAuthenticated = (req, res, next) => {
  const token = req.cookies.token;
  const rol = req.cookies.rol;
  
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      console.log('Rol en middleware', rol);
      
      if (rol === '2') {
        // console.log('Redirigiendo a administrador');
        return res.redirect('/administrator');
      } else if (rol === '1') {
        // console.log('Redirigiendo a dashboard');
        return res.redirect('/dashboard');
      }

      console.log('Rol no reconocido, redirigiendo a login');
    } catch (error) {
      res.clearCookie('token');
    }
  }
  next();
};

module.exports = { 
  authMiddleware,
  redirectIfAuthenticated,
  isAdmin,
  isUser
};