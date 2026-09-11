// tests/helpers/mockExpress.js
// Utilidades para simular req/res de Express sin levantar un servidor real.

function mockRequest({ body = {}, params = {}, query = {}, headers = {}, usuario } = {}) {
  return { body, params, query, headers, usuario };
} // Crea un objeto req falso con las propiedades típicas que Express le pone a la petición.

function mockResponse() {
 // Crea un objeto res falso con status y json como funciones espía de Jest.
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

module.exports = { mockRequest, mockResponse };
