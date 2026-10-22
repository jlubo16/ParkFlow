const db = require('../config/db');

// Obtener tarifas actuales
const getTarifas = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM tarifas');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener tarifas:', error);
        res.status(500).json({ error: 'Error al obtener tarifas.' });
    }
};

// Actualizar tarifas
const updateTarifas = async (req, res) => {
    try {
        const { carro, moto } = req.body;
        const id_usuario = req.usuario.id_usuario;

        if (req.usuario.rol !== 'admin') {
            return res.status(403).json({ error: 'Solo el administrador puede modificar tarifas.' });
        }

        const { rows: tarifasActuales } = await db.query('SELECT * FROM tarifas');
        const tarifaCarro = tarifasActuales.find(t => t.tipo_vehiculo === 'carro');
        const tarifaMoto = tarifasActuales.find(t => t.tipo_vehiculo === 'moto');

        if (carro && carro !== tarifaCarro.tarifa_por_hora) {
            await db.query(
                'UPDATE tarifas SET tarifa_por_hora = $1, ultima_actualizacion = NOW() WHERE tipo_vehiculo = $2',
                [carro, 'carro']
            );

            await db.query(
                `INSERT INTO historial_tarifas 
                 (tipo_vehiculo, tarifa_anterior, tarifa_nueva, id_usuario) 
                 VALUES ('carro', $1, $2, $3)`,
                [tarifaCarro.tarifa_por_hora, carro, id_usuario]
            );
        }

        if (moto && moto !== tarifaMoto.tarifa_por_hora) {
            await db.query(
                'UPDATE tarifas SET tarifa_por_hora = $1, ultima_actualizacion = NOW() WHERE tipo_vehiculo = $2',
                [moto, 'moto']
            );

            await db.query(
                `INSERT INTO historial_tarifas 
                 (tipo_vehiculo, tarifa_anterior, tarifa_nueva, id_usuario) 
                 VALUES ('moto', $1, $2, $3)`,
                [tarifaMoto.tarifa_por_hora, moto, id_usuario]
            );
        }

        res.json({
            success: true,
            mensaje: 'Tarifas actualizadas correctamente.'
        });
    } catch (error) {
        console.error('Error al actualizar tarifas:', error);
        res.status(500).json({ error: 'Error al actualizar tarifas.' });
    }
};

// Obtener historial de tarifas
const getHistorialTarifas = async (req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT h.*, u.nombre_completo 
             FROM historial_tarifas h
             JOIN usuario u ON h.id_usuario = u.id_usuario
             ORDER BY h.fecha_cambio DESC
             LIMIT 20`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ error: 'Error al obtener historial de tarifas.' });
    }
};

module.exports = { getTarifas, updateTarifas, getHistorialTarifas };