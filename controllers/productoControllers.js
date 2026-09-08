const fs = require('fs');
const path = require('path');

const productosPath = path.join(__dirname, '../data/productos.json');

const leerProductos = () => JSON.parse(fs.readFileSync(productosPath, 'utf-8'));
const guardarProductos = (datos) => fs.writeFileSync(productosPath, JSON.stringify(datos, null, 2));

// Obtener catálogo de productos
exports.obtenerProductos = (req, res) => {
  try {
    const productos = leerProductos();
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el catálogo de productos." });
  }
};

// Crear un nuevo producto
exports.crearProducto = (req, res) => {
  try {
    const { nombre, precio } = req.body;

    if (!nombre || !precio || typeof precio !== 'number') {
      return res.status(400).json({ error: "Nombre y precio (número) son obligatorios." });
    }

    const productos = leerProductos();
    const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 101;

    const nuevoProducto = { id: nuevoId, nombre, precio };
    productos.push(nuevoProducto);

    guardarProductos(productos);

    res.status(201).json({ mensaje: "Producto registrado con éxito", producto: nuevoProducto });
  } catch (error) {
    res.status(500).json({ error: "Error al guardar el producto." });
  }
};