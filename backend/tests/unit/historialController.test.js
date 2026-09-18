// tests/unit/historialController.test.js
// 1 prueba -> CP11 del documento Casos_de_prueba_SmartPark.xlsx

jest.mock('../../src/config/db');

const db = require('../../src/config/db');
const { getHistorialVehiculo } = require('../../src/controllers/historialController');
const { mockRequest, mockResponse } = require('../helpers/mockExpress');

// CP11: Consultar historial de un vehículo por placa
test('CP11 - devuelve el historial registrado para una placa específica', async () => {
  const registros = [{ id_registro: 10, placa: 'ABC123', monto: 5000 }];
  db.query.mockResolvedValueOnce([registros]);

  const req = mockRequest({ params: { placa: 'ABC123' }, usuario: { rol: 'empleado' } });
  const res = mockResponse();

  await getHistorialVehiculo(req, res);

  expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE v.placa = ?'), ['ABC123']);
  expect(res.json).toHaveBeenCalledWith(registros);
});
