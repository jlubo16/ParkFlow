class AuthView {
  static responderLoginExitoso(res, token, usuario) {
    delete usuario.contrasena;

    return res.json({
      success: true,
      token,
      usuario
    });
  }

  static responderError(res, statusCode, mensaje) {
    return res.status(statusCode).json({ error: mensaje });
  }
}

module.exports = AuthView;
