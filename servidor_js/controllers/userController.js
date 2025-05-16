const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  const fullname = req.body.fullname;
  const email = req.body.email.trim().toLowerCase(); // <-- Normaliza el email
  const address = req.body.address;
  const password = req.body.password;

  if (!fullname || !email || !address || !password) {
    return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
  }
  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(409).json({ success: false, message: 'El correo ya está registrado.' });
    }
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO usuarios (fullname, email, address, password) VALUES (?, ?, ?, ?)',
      [fullname, email, address, hash]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};

exports.login = async (req, res) => {
  const email = req.body.email.trim().toLowerCase(); // <-- Normaliza el email
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
  }
  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }
    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
    }
    res.json({ success: true, user: { id: user.id, fullname: user.fullname, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
};