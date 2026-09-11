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
// 1. Cuando se consulte la DB, devuelve este usuario admin 
db.query.mockResolvedValueOnce([[{ id_usuario:1, correo:'admin@smartpark.com', contrasena:'hash', rol:'admin' }]]);

// 2. Cuando se compare la contraseña, di que SÍ coincide
bcrypt.compare.mockResolvedValueOnce(true);

// 3. Cuando se genere el token, devuelve 'token-simulado'
jwt.sign.mockReturnValueOnce('token-simulado');

// 4. Simula la petición y la respuesta
const req = mockRequest({ body: { correo:'admin@smartpark.com', contrasena:'admin123' }});
const res = mockResponse();

// 5. Ejecuta la función real que estás probando
await login(req, res);

// 6. Verifica que respondió con éxito + token
expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success:true, token:'token-simulado' }));

// CP02: Login fallido por credenciales inválidas
test('CP02 - login falla con 401 cuando la contraseña no coincide', async () => {
  db.query.mockResolvedValueOnce([[{ id_usuario: 1, correo: 'admin@smartpark.com', contrasena: 'hash' }]]);
  bcrypt.compare.mockResolvedValueOnce(false);

  const req = mockRequest({ body: { correo: 'admin@smartpark.com', contrasena: 'incorrecta' } });
  const res = mockResponse();

  await login(req, res);

  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ error: 'Credenciales inválidas.' });
});
