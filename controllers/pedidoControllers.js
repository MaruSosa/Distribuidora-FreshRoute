const fs = require('fs');
const path = require('path');

// Ruta absoluta hacia el archivo pedidos.json
const pedidosPath = path.join(__dirname, '../data/pedidos.json');

// Función auxiliar para leer los pedidos
const leerPedidos = () => {
    const data = fs.readFileSync(pedidosPath, 'utf-8');
    return JSON.parse(data);
};

// 1. Obtener todos los pedidos (GET /api/pedidos)
exports.obtenerPedidos = (req, res) => {
    try {
        const pedidos = leerPedidos();
        res.status(200).json(pedidos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al leer los pedidos', error: error.message });
    }
};

// 2. Obtener pedido por ID (GET /api/pedidos/:id)
exports.obtenerPedidoPorId = (req, res) => {
    try {
        const pedidos = leerPedidos();
        const pedidoId = Number(req.params.id);
        const pedido = pedidos.find(p => Number(p.id) === pedidoId);
        
        if (!pedido) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }
        
        res.status(200).json(pedido);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al buscar el pedido', error: error.message });
    }
};


// 3. Crear un nuevo pedido (POST /api/pedidos)
exports.crearPedido = (req, res) => {
    try {
        const { cliente, productos, total, estado } = req.body;

        if (!cliente) {
            return res.status(400).json({ mensaje: 'El campo cliente es obligatorio.' });
        }

        const pedidos = leerPedidos();
        const nuevoId = pedidos.length > 0 ? pedidos[pedidos.length - 1].id + 1 : 1;

        const nuevoPedido = {
            id: nuevoId,
            cliente,
            productos: productos || [],
            total: Number(total) || 0,
            estado: estado || 'Pendiente',
            fecha: new Date().toISOString().split('T')[0]
        };

        pedidos.push(nuevoPedido);
        fs.writeFileSync(pedidosPath, JSON.stringify(pedidos, null, 2), 'utf-8');

        res.status(201).json({
            mensaje: 'Pedido creado exitosamente',
            pedido: nuevoPedido
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al guardar el pedido', error: error.message });
    }
};

// 4. Cambiar estado del pedido (PATCH /api/pedidos/:id/estado)
exports.cambiarEstado = (req, res) => {
    try {
        const { estado } = req.body;
        const pedidos = leerPedidos();
        const index = pedidos.findIndex(p => p.id === parseInt(req.params.id));

        if (index === -1) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }

        pedidos[index].estado = estado || pedidos[index].estado;
        fs.writeFileSync(pedidosPath, JSON.stringify(pedidos, null, 2), 'utf-8');

        res.status(200).json({
            mensaje: 'Estado del pedido actualizado',
            pedido: pedidos[index]
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar estado', error: error.message });
    }
};