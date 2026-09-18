// tests/unit/empleadoController.test.js
// 2 pruebas -> CP07 y CP08 del documento Casos_de_prueba_SmartPark.xlsx

jest.mock('../../src/config/db');
jest.mock('bcrypt');

const db = require('../../src/config/db');
const bcrypt = require('bcrypt');
const { crearEmpleado } = require('../../src/controllers/empleadoController');
const { mockRequest, mockResponse } = require('../helpers/mockExpress');

// CP07: Crear empleado exitosamente (rol admin)
test('CP07 - un admin puede crear un empleado nuevo', async () => {
  db.query
    .mockResolvedValueOnce([[]])              // el correo no existe todavía
    .mockResolvedValueOnce([{ insertId: 7 }]); // insert exitoso
  bcrypt.hash.mockResolvedValueOnce('hash-temporal');

  const req = mockRequest({
    body: { nombre_completo: 'Juan Pérez', correo: 'juan@smartpark.com' },
    usuario: { rol: 'admin' },
  });
  const res = mockResponse();

  await crearEmpleado(req, res);

  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
    success: true,
    empleado: expect.objectContaining({ id_usuario: 7 }),
  }));
});

// CP08: Crear empleado - acceso denegado a usuario no admin
test('CP08 - un usuario con rol "empleado" no puede crear empleados', async () => {
  const req = mockRequest({
    body: { nombre_completo: 'Otro', correo: 'otro@smartpark.com' },
    usuario: { rol: 'empleado' },
  });
  const res = mockResponse();

  await crearEmpleado(req, res);

  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json).toHaveBeenCalledWith({ error: 'Solo el administrador puede crear empleados.' });
  expect(db.query).not.toHaveBeenCalled(); // no debe tocar la base de datos
});
