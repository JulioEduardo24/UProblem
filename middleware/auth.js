export const verificarSesion = (req, res, next) => {
    if (!req.session || !req.session.isLoggedIn) {
        // Responder con JSON para evitar el alert en el frontend
        return res.status(401).json({
            error: 'Usuario no autenticado'
        });
    }
    next();
};
