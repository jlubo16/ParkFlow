const validateEntry = (req, res, next) => {
    const { placa, tipo_vehiculo, id_espacio } = req.body;
    
    // Validar placa (mínimo 3 caracteres, máximo 10)
    if (!placa || placa.length < 3 || placa.length > 10) {
        return res.status(400).json({ error: 'La placa debe tener entre 3 y 10 caracteres.' });
    }
    
    // Validar tipo de vehículo
    if (!['carro', 'moto'].includes(tipo_vehiculo)) {
        return res.status(400).json({ error: 'Tipo de vehículo inválido. Debe ser carro o moto.' });
    }
    
    // Validar espacio
    if (!id_espacio || typeof id_espacio !== 'number') {
        return res.status(400).json({ error: 'Debe seleccionar un espacio válido.' });
    }
    
    next();
};

module.exports = { validateEntry };