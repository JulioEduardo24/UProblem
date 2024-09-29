// middleware/auth.js
export const verificarSesion = (req, res, next) => {
    if (!req.session || !req.session.isLoggedIn) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    next();
};
