export const verificarSesion = (req, res, next) => {
    if (!req.session || !req.session.isLoggedIn) {
        // Redirigir al inicio si no hay sesión activa
        return res.redirect('/');
    }
    next();
};
