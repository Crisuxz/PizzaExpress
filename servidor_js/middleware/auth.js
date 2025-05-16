function requireLogin(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  }
  // Si no está autenticado, redirige al login
  res.redirect('/login.html');
}

module.exports = requireLogin;