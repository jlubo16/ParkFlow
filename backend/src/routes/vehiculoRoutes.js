const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { validateEntry } = require('../middleware/validation');
const {
    registrarEntrada,
    registrarSalida,
    getVehiculosEstacionados,
    getResumenEspacios
} = require('../controllers/vehiculoController');

router.use(authMiddleware);

router.get('/estacionados', getVehiculosEstacionados);
router.get('/resumen', getResumenEspacios);
router.post('/entrada', validateEntry, registrarEntrada);
router.post('/salida', registrarSalida);

module.exports = router;