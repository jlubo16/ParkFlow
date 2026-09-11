const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Controlador de autenticación del sistema.
// Login
const login = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({ error: 'Correo y contraseña son requeridos.' });
        }

        const { rows } = await db.query(
            'SELECT * FROM usuario WHERE correo = $1 AND estado = TRUE',
            [correo]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const usuario = rows[0];

        const validPassword = await bcrypt.compare(contrasena, usuario.contrasena);

        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre_completo,
                correo: usuario.correo,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        delete usuario.contrasena;

        res.json({
            success: true,
            token,
            usuario
        });
    } catch (error) {
        console.error('Error en login:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ error: 'Error al iniciar sesión.' });
    }
};

module.exports = { login };