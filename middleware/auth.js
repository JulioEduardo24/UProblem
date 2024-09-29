// middleware/auth.js
export const verificarSesion = (req, res, next) => {
    if (!req.session || !req.session.isLoggedIn) {
        // Si no está autorizado, redirigir al cliente a la raíz
        return res.status(401).send(`
            <script>
                window.location.href = "/";
            </script>
        `);
    }
    next();
};
