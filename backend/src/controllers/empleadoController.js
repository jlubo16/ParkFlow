const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Obtener todos los empleados
const getEmpleados = async (req, res) => {
    try {
        const { rows } = await db.query(
            "SELECT id_usuario, nombre_completo, correo, rol, fecha_creacion, estado FROM usuario WHERE rol = 'empleado'"
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener empleados:', error);
        res.status(500).json({ error: 'Error al obtener empleados.' });
    }
};

// Crear empleado
const crearEmpleado = async (req, res) => {
    try {
        const { nombre_completo, correo } = req.body;

        if (req.usuario.rol !== 'admin') {
            return res.status(403).json({ error: 'Solo el administrador puede crear empleados.' });
        }

        const { rows: existe } = await db.query(
            'SELECT * FROM usuario WHERE correo = $1',
            [correo]
        );

        if (existe.length > 0) {
            return res.status(400).json({ error: 'El correo ya está registrado.' });
        }

        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const result = await db.query(
            `INSERT INTO usuario (nombre_completo, correo, contrasena, rol)
             VALUES ($1, $2, $3, 'empleado')
             RETURNING id_usuario`,
            [nombre_completo, correo, hashedPassword]
        );

        res.json({
            success: true,
            mensaje: 'Empleado creado correctamente.',
            empleado: {
                id_usuario: result.rows[0].id_usuario,
                nombre_completo,
                correo,
                contrasena_temporal: tempPassword
            }
        });
    } catch (error) {
        console.error('Error al crear empleado:', error);
        res.status(500).json({ error: 'Error al crear empleado.' });
    }
};

// Actualizar empleado
const updateEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_completo, correo, estado } = req.body;

        if (req.usuario.rol !== 'admin') {
            return res.status(403).json({ error: 'Solo el administrador puede modificar empleados.' });
        }

        const { rows: existe } = await db.query(
            "SELECT * FROM usuario WHERE id_usuario = $1 AND rol = 'empleado'",
            [id]
        );

        if (existe.length === 0) {
            return res.status(404).json({ error: 'Empleado no encontrado.' });
        }

        if (estado !== undefined && typeof estado !== 'boolean') {
            return res.status(400).json({ error: 'El campo estado debe ser booleano (true/false).' });
        }

        let query = 'UPDATE usuario SET ';
        const params = [];
        const updates = [];

        if (nombre_completo) {
            updates.push('nombre_completo = $' + (params.length + 1));
            params.push(nombre_completo);
        }

        if (correo) {
            updates.push('correo = $' + (params.length + 1));
            params.push(correo);
        }

        if (estado !== undefined) {
            updates.push('estado = $' + (params.length + 1));
            params.push(estado);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No hay campos para actualizar.' });
        }

        query += updates.join(', ') + ' WHERE id_usuario = $' + (params.length + 1);
        params.push(id);

        await db.query(query, params);

        res.json({ success: true, mensaje: 'Empleado actualizado correctamente.' });
    } catch (error) {
        console.error('Error al actualizar empleado:', error);
        res.status(500).json({ error: 'Error al actualizar empleado.' });
    }
};

// Eliminar empleado (desactivar)
const deleteEmpleado = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.usuario.rol !== 'admin') {
            return res.status(403).json({ error: 'Solo el administrador puede eliminar empleados.' });
        }

        const { rows: existe } = await db.query(
            "SELECT * FROM usuario WHERE id_usuario = $1 AND rol = 'empleado'",
            [id]
        );

        if (existe.length === 0) {
            return res.status(404).json({ error: 'Empleado no encontrado.' });
        }

        await db.query(
            'UPDATE usuario SET estado = FALSE WHERE id_usuario = $1',
            [id]
        );

        res.json({ success: true, mensaje: 'Empleado desactivado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar empleado:', error);
        res.status(500).json({ error: 'Error al eliminar empleado.' });
    }
};

module.exports = {
    getEmpleados,
    crearEmpleado,
    updateEmpleado,
    deleteEmpleado
};