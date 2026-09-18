const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/UsuarioModel');
const AuthView = require('../views/AuthView');

class AuthControllerMVC {
  async login(req, res) {
    try {
      const { correo, contrasena } = req.body;

      if (!correo || !contrasena) {
        return AuthView.responderError(res, 400, 'Correo y contraseña son requeridos.');
      }

      const usuario = await UsuarioModel.buscarPorCorreo(correo);
      if (!usuario) {
        return AuthView.responderError(res, 401, 'Credenciales inválidas.');
      }

      const validPassword = await bcrypt.compare(contrasena, usuario.contrasena);
      if (!validPassword) {
        return AuthView.responderError(res, 401, 'Credenciales inválidas.');
      }

      const token = jwt.sign(
        {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre_completo,
          correo: usuario.correo,
          rol: usuario.rol
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      return AuthView.responderLoginExitoso(res, token, usuario);
    } catch (error) {
      console.error('Error en login MVC:', error);
      return AuthView.responderError(res, 500, 'Error al iniciar sesión.');
    }
  }
}

module.exports = new AuthControllerMVC();
