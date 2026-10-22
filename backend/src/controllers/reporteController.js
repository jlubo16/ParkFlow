const db = require('../config/db');

// Generar reporte de ingresos
const getReporteIngresos = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin } = req.query;

        const inicio = fecha_inicio || new Date().toISOString().split('T')[0];
        const fin = fecha_fin || new Date().toISOString().split('T')[0];

        const { rows: ingresos } = await db.query(
            `SELECT SUM(monto) AS total_ingresos 
             FROM transaccion_pago 
             WHERE DATE(fecha_pago) BETWEEN $1 AND $2`,
            [inicio, fin]
        );

        const { rows: vehiculos } = await db.query(
            `SELECT COUNT(*) AS total_vehiculos 
             FROM transaccion_pago 
             WHERE DATE(fecha_pago) BETWEEN $1 AND $2`,
            [inicio, fin]
        );

        const { rows: desglose } = await db.query(
            `SELECT v.tipo_vehiculo, COUNT(*) AS cantidad, SUM(t.monto) AS total 
             FROM transaccion_pago t
             JOIN vehiculo_estacionado v ON t.id_registro = v.id_registro
             WHERE DATE(t.fecha_pago) BETWEEN $1 AND $2
             GROUP BY v.tipo_vehiculo`,
            [inicio, fin]
        );

        const { rows: dias } = await db.query(
            `SELECT COUNT(DISTINCT DATE(fecha_pago)) AS dias 
             FROM transaccion_pago 
             WHERE DATE(fecha_pago) BETWEEN $1 AND $2`,
            [inicio, fin]
        );

        const totalIngresos = ingresos[0]?.total_ingresos || 0;
        const totalVehiculos = vehiculos[0]?.total_vehiculos || 0;
        const diasConDatos = dias[0]?.dias || 1;
        const promedioDiario = totalIngresos / diasConDatos;

        const { rows: mejorDia } = await db.query(
            `SELECT DATE(fecha_pago) AS fecha, SUM(monto) AS total 
             FROM transaccion_pago 
             WHERE DATE(fecha_pago) BETWEEN $1 AND $2
             GROUP BY DATE(fecha_pago)
             ORDER BY total DESC
             LIMIT 1`,
            [inicio, fin]
        );

        res.json({
            periodo: { inicio, fin },
            total_ingresos: totalIngresos,
            total_vehiculos: totalVehiculos,
            desglose: desglose.reduce((acc, row) => ({
                ...acc,
                [row.tipo_vehiculo]: {
                    cantidad: row.cantidad,
                    total: row.total
                }
            }), {}),
            promedio_diario: promedioDiario,
            mejor_dia: mejorDia[0] || null,
            dias_con_datos: diasConDatos
        });
    } catch (error) {
        console.error('Error al generar reporte:', error);
        res.status(500).json({ error: 'Error al generar reporte de ingresos.' });
    }
};

module.exports = { getReporteIngresos };