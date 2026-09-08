const express = require('express');
const router = express.Router();
const productoControllers = require('../controllers/productoControllers');

// GET /api/productos - Listar productos
router.get('/', productoControllers.obtenerProductos);

// POST /api/productos - Agregar producto
router.post('/', productoControllers.crearProducto);

module.exports = router;