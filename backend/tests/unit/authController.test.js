// tests/unit/authController.test.js
// 2 pruebas -> CP01 y CP02 del documento Casos_de_prueba_SmartPark.xlsx

jest.mock('../../src/config/db');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const db = require('../../src/config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { login } = require('../../src/controllers/authController');
const { mockRequest, mockResponse } = require('../helpers/mockExpress');

// CP01: Login exitoso
test('CP01 - login exitoso devuelve un token', async () => {
  db.query.mockResolvedValueOnce({
    rows: [{
      id_usuario: 1,
      correo: 'admin@smartpark.com',
      contrasena: 'hash',
      rol: 'admin',
      nombre_completo: 'Administrador',
    }],
  });
  bcrypt.compare.mockResolvedValueOnce(true);
  jwt.sign.mockReturnValueOnce('token-simulado');

  const req = mockRequest({ body: { correo: 'admin@smartpark.com', contrasena: 'admin123' } });
  const res = mockResponse();

  await login(req, res);

  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
    success: true,
    token: 'token-simulado',
  }));
});

// CP02: Login fallido por credenciales inválidas
test('CP02 - login falla con 401 cuando la contraseña no coincide', async () => {
  db.query.mockResolvedValueOnce({
    rows: [{ id_usuario: 1, correo: 'admin@smartpark.com', contrasena: 'hash' }],
  });
  bcrypt.compare.mockResolvedValueOnce(false);

  const req = mockRequest({ body: { correo: 'admin@smartpark.com', contrasena: 'incorrecta' } });
  const res = mockResponse();

  await login(req, res);

  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ error: 'Credenciales inválidas.' });
});
