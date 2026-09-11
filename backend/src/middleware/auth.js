const jwt = require('jsonwebtoken'); // jsonwebtoken: librería para crear y verificar tokens JWT.
require('dotenv').config();

// authMiddleware: verifica que el usuario esté autenticado

const authMiddleware = (req, res, next) => {
    try {
        // Obtener token del header
        const token = req.headers.authorization?.split(' ')[1];
        
        // Si no hay token, el usuario no ha iniciado sesión.
        if (!token) {
            return res.status(401).json({ error: 'No autorizado. Token no proporcionado.' });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};

// Middleware para verificar si es admin
const adminMiddleware = (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware };