const express = require('express');
const router = express.Router();
const pizzaController = require('../controllers/pizzaController');

router.get('/', pizzaController.getAll);
router.post('/', pizzaController.create);

module.exports = router;