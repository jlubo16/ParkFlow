const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { getReporteIngresos } = require('../controllers/reporteController');

router.get('/ingresos', authMiddleware, adminMiddleware, getReporteIngresos);

module.exports = router;