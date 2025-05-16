const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pizzas');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las pizzas.' });
  }
};

exports.create = async (req, res) => {
  const { nombre, precio, ingredientes } = req.body;
  if (!nombre || !precio) {
    return res.status(400).json({ message: 'Nombre y precio son obligatorios.' });
  }
  try {
    await db.query(
      'INSERT INTO pizzas (nombre, precio, ingredientes) VALUES (?, ?, ?)',
      [nombre, precio, ingredientes]
    );
    res.json({ message: 'Pizza creada correctamente.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la pizza.' });
  }
};