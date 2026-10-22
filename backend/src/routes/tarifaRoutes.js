const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
    getTarifas,
    updateTarifas,
    getHistorialTarifas
} = require('../controllers/tarifaController');

router.use(authMiddleware);

router.get('/', getTarifas);
router.get('/historial', getHistorialTarifas);
router.put('/', adminMiddleware, updateTarifas);

module.exports = router;