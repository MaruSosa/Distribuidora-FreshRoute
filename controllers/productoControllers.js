const fs = require('fs');
const path = require('path');

// Ruta absoluta hacia el archivo productos.json
const productosPath = path.join(__dirname, '../data/productos.json');

// Función auxiliar para leer los productos del archivo JSON
const leerProductos = () => {
    const data = fs.readFileSync(productosPath, 'utf-8');
    return JSON.parse(data);
};

// 1. Obtener todos los productos (GET /api/productos)
exports.obtenerProductos = (req, res) => {
    try {
        const productos = leerProductos();
        res.status(200).json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al leer los productos', error: error.message });
    }
};

// 2. Crear un nuevo producto (POST /api/productos)
exports.crearProducto = (req, res) => {
    try {
        const { nombre, precio, categoria, stock } = req.body;

        // Validación simple
        if (!nombre || !precio) {
            return res.status(400).json({ mensaje: 'El nombre y el precio son obligatorios.' });
        }

        const productos = leerProductos();

        // Generar un ID nuevo (autoincremental)
        const nuevoId = productos.length > 0 ? productos[productos.length - 1].id + 1 : 1;

        const nuevoProducto = {
            id: nuevoId,
            nombre,
            precio: Number(precio),
            categoria: categoria || 'General',
            stock: Number(stock) || 0
        };

        productos.push(nuevoProducto);

        // Guardar la lista actualizada de vuelta en el archivo JSON
        fs.writeFileSync(productosPath, JSON.stringify(productos, null, 2), 'utf-8');

        res.status(201).json({
            mensaje: 'Producto guardado exitosamente',
            producto: nuevoProducto
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al guardar el producto', error: error.message });
    }
};