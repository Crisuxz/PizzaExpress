const express = require('express');
const router = express.Router();

// Recibe la conexión a la base de datos desde index.js
module.exports = (db) => {
  // Guardar un pedido
  router.post('/', (req, res) => {
    const { usuario_id, pedido, nombre, direccion, metodoPago } = req.body;
    if (!usuario_id || !pedido || !nombre || !direccion || !metodoPago) {
      return res.status(400).json({ success: false, message: "Datos incompletos" });
    }
    db.query(
      'INSERT INTO pedidos (usuario_id, pedido, nombre, direccion, metodo_pago, estado, fecha) VALUES (?, ?, ?, ?, ?, "pendiente", NOW())',
      [usuario_id, JSON.stringify(pedido), nombre, direccion, metodoPago],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: "Error al guardar el pedido" });
        }
        // Devuelve el id insertado
        res.json({ success: true, message: "Pedido guardado correctamente", pedidoId: result.insertId });
      }
    );
  });

  // Obtener pedidos de un usuario
  router.get('/usuario/:usuario_id', (req, res) => {
    const usuario_id = req.params.usuario_id;
    db.query(
      'SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY fecha DESC',
      [usuario_id],
      (err, rows) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: "Error al obtener pedidos" });
        }
        res.json({ success: true, pedidos: rows });
      }
    );
  });

  return router;
};