const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userName = decoded.nombres
    req.rol = decoded.rol;
    next();
  } catch (error) {
    res.clearCookie('token');
    return res.redirect('/auth/login');
  }
};

const redirectIfAuthenticated = (req, res, next) => {
  const token = req.cookies.token;
  const rol = req.cookies.rol;
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      console.log('Rol en middleware', rol);
      if (rol === '2') {
        console.log('Redirigiendo a administrador');
        return res.redirect('/administrator');
      } else if (rol === '1') {
        console.log('Redirigiendo a dashboard');
        return res.redirect('/dashboard');
      }
      console.log('Rol no reconocido, redirigiendo a login');
    } catch (error) {
      res.clearCookie('token');
    }
  }
  next();
};

module.exports = { authMiddleware, redirectIfAuthenticated };