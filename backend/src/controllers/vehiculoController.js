const db = require('../config/db');

// Registrar entrada
const registrarEntrada = async (req, res) => {
    try {
        const { placa, tipo_vehiculo, id_espacio } = req.body;
        const id_usuario = req.usuario.id_usuario;

        const { rows: espacioRows } = await db.query(
            "SELECT * FROM espacio WHERE id_espacio = $1 AND estado = 'disponible'",
            [id_espacio]
        );

        if (espacioRows.length === 0) {
            return res.status(400).json({ error: 'El espacio no está disponible.' });
        }

        const espacio = espacioRows[0];

        if (espacio.tipo_vehiculo !== tipo_vehiculo) {
            return res.status(400).json({
                error: `El espacio ${espacio.codigo} es para ${espacio.tipo_vehiculo}s.`
            });
        }

        const { rows: vehiculoActivo } = await db.query(
            'SELECT * FROM vehiculo_estacionado WHERE placa = $1 AND hora_salida IS NULL',
            [placa]
        );

        if (vehiculoActivo.length > 0) {
            return res.status(400).json({ error: 'Este vehículo ya está estacionado.' });
        }

        const result = await db.query(
            `INSERT INTO vehiculo_estacionado 
             (placa, tipo_vehiculo, id_espacio, id_usuario, hora_entrada) 
             VALUES ($1, $2, $3, $4, NOW())
             RETURNING id_registro`,
            [placa, tipo_vehiculo, id_espacio, id_usuario]
        );

        await db.query(
            "UPDATE espacio SET estado = 'ocupado' WHERE id_espacio = $1",
            [id_espacio]
        );

        res.json({
            success: true,
            mensaje: `Vehículo ${placa} registrado en espacio ${espacio.codigo}`,
            id_registro: result.rows[0].id_registro,
            espacio: espacio.codigo,
            hora_entrada: new Date()
        });
    } catch (error) {
        console.error('Error en registrar entrada:', error);
        res.status(500).json({ error: 'Error al registrar entrada.' });
    }
};

// Registrar salida
const registrarSalida = async (req, res) => {
    try {
        const { id_registro } = req.body;
        const id_usuario = req.usuario.id_usuario;

        const { rows } = await db.query(
            `SELECT v.*, e.codigo AS espacio_codigo, t.tarifa_por_hora 
             FROM vehiculo_estacionado v
             JOIN espacio e ON v.id_espacio = e.id_espacio
             JOIN tarifas t ON t.tipo_vehiculo = v.tipo_vehiculo
             WHERE v.id_registro = $1 AND v.hora_salida IS NULL`,
            [id_registro]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Vehículo no encontrado o ya salió.' });
        }

        const vehiculo = rows[0];

        const ahora = new Date();
        const entrada = new Date(vehiculo.hora_entrada);
        const minutos = Math.ceil((ahora - entrada) / (1000 * 60));
        const horas = Math.ceil(minutos / 60);
        const total = horas * parseFloat(vehiculo.tarifa_por_hora);

        await db.query(
            `UPDATE vehiculo_estacionado 
             SET hora_salida = NOW(), 
                 tiempo_estacionado = $1, 
                 total_pagado = $2 
             WHERE id_registro = $3`,
            [minutos, total, id_registro]
        );

        await db.query(
            "UPDATE espacio SET estado = 'disponible' WHERE id_espacio = $1",
            [vehiculo.id_espacio]
        );

        await db.query(
            `INSERT INTO transaccion_pago 
             (id_registro, monto, metodo_pago, fecha_pago, id_usuario) 
             VALUES ($1, $2, 'efectivo', NOW(), $3)`,
            [id_registro, total, id_usuario]
        );

        res.json({
            success: true,
            mensaje: 'Salida registrada correctamente.',
            placa: vehiculo.placa,
            espacio: vehiculo.espacio_codigo,
            hora_entrada: vehiculo.hora_entrada,
            hora_salida: ahora,
            minutos_estacionado: minutos,
            horas_estacionado: horas,
            tarifa_por_hora: parseFloat(vehiculo.tarifa_por_hora),
            total_pagado: total
        });
    } catch (error) {
        console.error('Error en registrar salida:', error);
        res.status(500).json({ error: 'Error al registrar salida.' });
    }
};

// Obtener vehículos estacionados
const getVehiculosEstacionados = async (req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT v.*, e.codigo AS espacio_codigo 
             FROM vehiculo_estacionado v
             JOIN espacio e ON v.id_espacio = e.id_espacio
             WHERE v.hora_salida IS NULL
             ORDER BY v.hora_entrada ASC`
        );

        res.json(rows);
    } catch (error) {
        console.error('Error al obtener vehículos:', error);
        res.status(500).json({ error: 'Error al obtener vehículos estacionados.' });
    }
};

// Obtener resumen de espacios
const getResumenEspacios = async (req, res) => {
    try {
        const { rows: total } = await db.query(
            'SELECT COUNT(*) AS total FROM espacio'
        );

        const { rows: ocupados } = await db.query(
            "SELECT COUNT(*) AS ocupados FROM espacio WHERE estado = 'ocupado'"
        );

        const { rows: disponibles } = await db.query(
            "SELECT COUNT(*) AS disponibles FROM espacio WHERE estado = 'disponible'"
        );

        const { rows: carros } = await db.query(
            "SELECT estado, COUNT(*) AS cantidad FROM espacio WHERE tipo_vehiculo = 'carro' GROUP BY estado"
        );

        const { rows: motos } = await db.query(
            "SELECT estado, COUNT(*) AS cantidad FROM espacio WHERE tipo_vehiculo = 'moto' GROUP BY estado"
        );

        const { rows: espacios } = await db.query(
            'SELECT * FROM espacio ORDER BY codigo'
        );

        res.json({
            total: total[0].total,
            ocupados: ocupados[0].ocupados,
            disponibles: disponibles[0].disponibles,
            carros: carros.reduce((acc, row) => ({ ...acc, [row.estado]: row.cantidad }), { disponible: 0, ocupado: 0, mantenimiento: 0 }),
            motos: motos.reduce((acc, row) => ({ ...acc, [row.estado]: row.cantidad }), { disponible: 0, ocupado: 0, mantenimiento: 0 }),
            espacios
        });
    } catch (error) {
        console.error('Error al obtener resumen:', error);
        res.status(500).json({ error: 'Error al obtener resumen de espacios.' });
    }
};

module.exports = {
    registrarEntrada,
    registrarSalida,
    getVehiculosEstacionados,
    getResumenEspacios
};