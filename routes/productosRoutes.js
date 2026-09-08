const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

// GET /api/productos - Listar productos
router.get('/', productoController.obtenerProductos);

// POST /api/productos - Agregar producto
router.post('/', productoController.crearProducto);

module.exports = router;