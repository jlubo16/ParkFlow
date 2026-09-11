const db = require('../config/db'); // db: pool de conexiones a MySQL (con promesas).


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Login
// async: porque usamos await para consultas DB y bcrypt.
// req.body = { correo, contrasena } (gracias a express.json()).
const login = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;
        
        // Validar que llegaron los datos
        // 2. Validación básica: que ambos campos existan.
        if (!correo || !contrasena) {
        
            return res.status(400).json({ error: 'Correo y contraseña son requeridos.' });
        }
        
        // Buscar usuario
       
        const [rows] = await db.query(
            'SELECT * FROM usuario WHERE correo = ? AND estado = TRUE',
            [correo]
        );
        
       // 4. Si no existe, rechaza (mensaje genérico por seguridad).
        
        if (rows.length === 0) {
          
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }
        
        const usuario = rows[0];
       
        
        // Verificar contraseña (bcrypt)
       
        const validPassword = await bcrypt.compare(contrasena, usuario.contrasena);
      
        
        if (!validPassword) {
         
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }
        
        // Generar JWT
      
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