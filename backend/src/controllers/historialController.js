const db = require('../config/db');

// Obtener historial completo
const getHistorial = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin, id_usuario } = req.query;
        
        let query = `
            SELECT 
                v.id_registro,
                v.placa,
                v.tipo_vehiculo,
                e.codigo AS espacio,
                v.hora_entrada,
                v.hora_salida,
                v.tiempo_estacionado,
                v.total_pagado,
                u.nombre_completo AS empleado,
                t.monto,
                t.metodo_pago,
                t.fecha_pago
            FROM vehiculo_estacionado v
            JOIN espacio e ON v.id_espacio = e.id_espacio
            JOIN usuario u ON v.id_usuario = u.id_usuario
            LEFT JOIN transaccion_pago t ON v.id_registro = t.id_registro
            WHERE 1=1
        `;
        
        const params = [];
        
        if (fecha_inicio && fecha_fin) {
            query += ` AND DATE(v.hora_entrada) BETWEEN ? AND ?`;
            params.push(fecha_inicio, fecha_fin);
        } else if (fecha_inicio) {
            query += ` AND DATE(v.hora_entrada) >= ?`;
            params.push(fecha_inicio);
        } else if (fecha_fin) {
            query += ` AND DATE(v.hora_entrada) <= ?`;
            params.push(fecha_fin);
        }
        
        if (id_usuario) {
            query += ` AND v.id_usuario = ?`;
            params.push(id_usuario);
        }
        
        query += ` ORDER BY v.hora_entrada DESC LIMIT 200`;
        
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ error: 'Error al obtener historial.' });
    }
};

// Obtener historial de un vehículo específico
const getHistorialVehiculo = async (req, res) => {
    try {
        const { placa } = req.params;
        
        const [rows] = await db.query(
            `SELECT 
                v.*,
                e.codigo AS espacio,
                u.nombre_completo AS empleado,
                t.monto,
                t.metodo_pago
             FROM vehiculo_estacionado v
             JOIN espacio e ON v.id_espacio = e.id_espacio
             JOIN usuario u ON v.id_usuario = u.id_usuario
             LEFT JOIN transaccion_pago t ON v.id_registro = t.id_registro
             WHERE v.placa = ?
             ORDER BY v.hora_entrada DESC
             LIMIT 50`,
            [placa]
        );
        
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener historial del vehículo:', error);
        res.status(500).json({ error: 'Error al obtener historial del vehículo.' });
    }
};

module.exports = { getHistorial, getHistorialVehiculo };