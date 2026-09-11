const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { getHistorial, getHistorialVehiculo } = require('../controllers/historialController');

router.use(authMiddleware);

router.get('/', getHistorial);
router.get('/vehiculo/:placa', getHistorialVehiculo);

module.exports = router;