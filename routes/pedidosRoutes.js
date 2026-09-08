const express = require('express');
const router = express.Router();
const pedidoControllers = require('../controllers/pedidoControllers');

// GET /api/pedidos - Obtener todos (admite ?clienteId=1 o ?estado=Pendiente)
router.get('/', pedidoControllers.obtenerPedidos);

// GET /api/pedidos/:id - Obtener pedido por ID
router.get('/:id', pedidoControllers.obtenerPedidoPorId);

// POST /api/pedidos - Crear un nuevo pedido
router.post('/', pedidoControllers.crearPedido);

// PATCH /api/pedidos/:id/estado - Cambiar estado del pedido
router.patch('/:id/estado', pedidoControllers.cambiarEstado);

module.exports = router;