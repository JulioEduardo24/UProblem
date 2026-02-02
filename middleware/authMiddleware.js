const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userName = decoded.nombres;
    next();
  } catch (error) {
    res.clearCookie('token');
    return res.redirect('/auth/login');
  }
};

const redirectIfAuthenticated = (req, res, next) => {
  const token = req.cookies.token;
  
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.redirect('/dashboard');
    } catch (error) {
      res.clearCookie('token');
    }
  }
  next();
};

module.exports = { authMiddleware, redirectIfAuthenticated };