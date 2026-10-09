const db = require('../config/db');

class UsuarioModel {
  async buscarPorCorreo(correo) {
    if (typeof correo !== 'string') {
      return null;
    }

    const correoNormalizado = correo.trim().toLowerCase();

    if (!correoNormalizado) {
      return null;
    }

    const { rows } = await db.query(
      'SELECT * FROM usuario WHERE LOWER(correo) = LOWER($1) AND estado = TRUE',
      [correoNormalizado]
    );

    return rows[0] || null;
  }
}

module.exports = new UsuarioModel();
