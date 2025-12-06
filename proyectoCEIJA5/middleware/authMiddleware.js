const jwt = require('jsonwebtoken'); // Si usas JWT para autenticación

// Middleware para verificar roles
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        try {
            // Verificar el token
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'No autorizado. Token no proporcionado.' });
            }

            // Decodificar el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            // Verificar si el rol del usuario está permitido
            if (!roles.includes(req.user.rol)) {
                return res.status(403).json({ message: 'Acceso denegado. No tienes los permisos necesarios.' });
            }

            next(); // Continuar con la solicitud
        } catch (error) {
            console.error('Error en la autorización:', error);
            res.status(401).json({ message: 'No autorizado. Token inválido.' });
        }
    };
};

module.exports = authorizeRoles;