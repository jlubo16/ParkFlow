const db = require('../config/db');

class UsuarioModel {
  async buscarPorCorreo(correo) {
    const { rows } = await db.query(
      'SELECT * FROM usuario WHERE correo = $1 AND estado = TRUE',
      [correo]
    );
    return rows[0] || null;
  }
}

module.exports = new UsuarioModel();
