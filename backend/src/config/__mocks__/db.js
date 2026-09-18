// src/config/__mocks__/db.js
// Mock manual usado automáticamente por jest.mock('../../src/config/db').
// Evita que las pruebas intenten conectarse a una base de datos MySQL real.
module.exports = {
  query: jest.fn(),
};
