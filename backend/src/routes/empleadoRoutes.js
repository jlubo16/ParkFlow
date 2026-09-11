const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const {
    getEmpleados,
    crearEmpleado,
    updateEmpleado,
    deleteEmpleado
} = require('../controllers/empleadoController');

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', getEmpleados);
router.post('/', crearEmpleado);
router.put('/:id', updateEmpleado);
router.delete('/:id', deleteEmpleado);

module.exports = router;