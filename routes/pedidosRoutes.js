const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

// GET /api/pedidos - Obtener todos (admite ?clienteId=1 o ?estado=Pendiente)
router.get('/', pedidoController.obtenerPedidos);

// GET /api/pedidos/:id - Obtener pedido por ID
router.get('/:id', pedidoController.obtenerPedidoPorId);

// POST /api/pedidos - Crear un nuevo pedido
router.post('/', pedidoController.crearPedido);

// PATCH /api/pedidos/:id/estado - Cambiar estado del pedido
router.patch('/:id/estado', pedidoController.cambiarEstado);

module.exports = router;