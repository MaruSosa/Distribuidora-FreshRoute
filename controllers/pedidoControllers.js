const fs = require('fs');
const path = require('path');
const Pedido = require('../models/pedido');

// Rutas a los archivos JSON
const pedidosPath = path.join(__dirname, '../data/pedidos.json');
const clientesPath = path.join(__dirname, '../data/clientes.json');
const productosPath = path.join(__dirname, '../data/productos.json');
const repartidoresPath = path.join(__dirname, '../data/repartidores.json');

// Funciones auxiliares para lectura y escritura
const leerJSON = (ruta) => JSON.parse(fs.readFileSync(ruta, 'utf-8'));
const guardarJSON = (ruta, datos) => fs.writeFileSync(ruta, JSON.stringify(datos, null, 2));

// 1. Obtener todos los pedidos (con opción de filtrado por cliente y por estado)
exports.obtenerPedidos = (req, res) => {
  try {
    let pedidos = leerJSON(pedidosPath);
    const { clienteId, estado } = req.query;

    // Consulta: Filtrar por Cliente
    if (clienteId) {
      pedidos = pedidos.filter(p => p.clienteId === parseInt(clienteId));
    }

    // Consulta: Filtrar por Estado
    if (estado) {
      pedidos = pedidos.filter(p => p.estado.toLowerCase() === estado.toLowerCase());
    }

    res.status(200).json(pedidos);
  } catch (error) {
    res.status(500).json({ error: "Error interno al obtener los pedidos." });
  }
};

// 2. Obtener un pedido por ID
exports.obtenerPedidoPorId = (req, res) => {
  try {
    const pedidos = leerJSON(pedidosPath);
    const pedido = pedidos.find(p => p.id === parseInt(req.params.id));

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado." });
    }

    res.status(200).json(pedido);
  } catch (error) {
    res.status(500).json({ error: "Error al consultar el pedido." });
  }
};

// 3. Crear un nuevo pedido
exports.crearPedido = (req, res) => {
  try {
    const { clienteId, productos, repartidorId } = req.body;

    // Validaciones de campos obligatorios
    if (!clienteId || !productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: "Un pedido debe contener un cliente válido y al menos un producto." });
    }

    // Validar existencia del cliente
    const clientes = leerJSON(clientesPath);
    const clienteExiste = clientes.some(c => c.id === parseInt(clienteId));
    if (!clienteExiste) {
      return res.status(404).json({ error: "El cliente especificado no existe." });
    }

    // Validar existencia de los productos
    const productosDB = leerJSON(productosPath);
    for (const item of productos) {
      const prodExiste = productosDB.some(p => p.id === parseInt(item.productoId));
      if (!prodExiste) {
        return res.status(404).json({ error: `El producto con ID ${item.productoId} no existe.` });
      }
    }

    // Regla de negocio: Si se asigna un repartidor al crearlo, verificar que esté disponible
    if (repartidorId) {
      const repartidores = leerJSON(repartidoresPath);
      const repartidor = repartidores.find(r => r.id === parseInt(repartidorId));
      
      if (!repartidor) {
        return res.status(404).json({ error: "El repartidor especificado no existe." });
      }
      if (!repartidor.disponible) {
        return res.status(400).json({ error: "Solo un repartidor disponible puede recibir un pedido." });
      }
    }

    // Generar ID e instanciar usando POO
    const pedidos = leerJSON(pedidosPath);
    const nuevoId = pedidos.length > 0 ? Math.max(...pedidos.map(p => p.id)) + 1 : 1001;
    
    const nuevoPedido = new Pedido(nuevoId, parseInt(clienteId), productos, repartidorId ? parseInt(repartidorId) : null);

    pedidos.push(nuevoPedido);
    guardarJSON(pedidosPath, pedidos);

    res.status(201).json({ mensaje: "Pedido creado exitosamente", pedido: nuevoPedido });
  } catch (error) {
    res.status(500).json({ error: "Error interno al crear el pedido." });
  }
};

// 4. Cambio de estado y asignación de repartidor
exports.cambiarEstado = (req, res) => {
  try {
    const { id } = req.params;
    const { nuevoEstado, repartidorId } = req.body;

    if (!nuevoEstado) {
      return res.status(400).json({ error: "El campo 'nuevoEstado' es obligatorio." });
    }

    const pedidos = leerJSON(pedidosPath);
    const index = pedidos.findIndex(p => p.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ error: "Pedido no encontrado." });
    }

    const pedidoData = pedidos[index];
    // Reconstruir objeto POO para usar sus métodos
    const pedidoObj = new Pedido(
      pedidoData.id,
      pedidoData.clienteId,
      pedidoData.productos,
      pedidoData.repartidorId,
      pedidoData.estado,
      pedidoData.fecha
    );

    // Validar transición permitida
    if (!pedidoObj.puedeTransicionarA(nuevoEstado)) {
      return res.status(400).json({
        error: `Transición inválida: No se puede cambiar un pedido de estado '${pedidoObj.estado}' a '${nuevoEstado}'.`
      });
    }

    // Regla de negocio: Validar asignación de repartidor al pasar a 'En camino'
    if (nuevoEstado === 'En camino') {
      const repId = repartidorId || pedidoObj.repartidorId;
      if (!repId) {
        return res.status(400).json({ error: "Debe asignar un repartidor para enviar el pedido." });
      }

      const repartidores = leerJSON(repartidoresPath);
      const repartidor = repartidores.find(r => r.id === parseInt(repId));

      if (!repartidor) {
        return res.status(404).json({ error: "El repartidor no existe." });
      }
      if (!repartidor.disponible) {
        return res.status(400).json({ error: "El repartidor seleccionado no está disponible." });
      }

      pedidoObj.repartidorId = parseInt(repId);
    }

    // Aplicar el cambio de estado
    pedidoObj.estado = nuevoEstado;
    pedidos[index] = pedidoObj;

    guardarJSON(pedidosPath, pedidos);

    res.status(200).json({ mensaje: "Estado actualizado correctamente", pedido: pedidoObj });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el estado del pedido." });
  }
};