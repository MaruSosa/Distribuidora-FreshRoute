const express = require('express');
const path = require('path');

// Importar rutas
const pedidoRoutes = require('./routes/pedidoRoutes');
const productoRoutes = require('./routes/productoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Enrutamiento de la API REST
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/productos', productoRoutes);

// Ruta para la vista renderizada en Pug
app.get('/', (req, res) => {
  res.render('index', { titulo: 'Distribuidora FreshRoute - Sistema de Gestión' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});