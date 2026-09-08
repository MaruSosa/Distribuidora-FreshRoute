class Pedido {
  constructor(id, clienteId, productos, repartidorId = null, estado = 'Pendiente', fecha = new Date().toISOString()) {
    this.id = id;
    this.clienteId = clienteId;
    this.productos = productos; // Array de { productoId, cantidad }
    this.repartidorId = repartidorId;
    this.estado = estado;
    this.fecha = fecha;
  }

  // Definición de estados válidos[cite: 1]
  static ESTADOS = ['Pendiente', 'Preparado', 'En camino', 'Entregado', 'Cancelado'];

  // Matriz de transiciones permitidas según la consigna[cite: 1]
  static TRANSICIONES = {
    'Pendiente': ['Preparado', 'Cancelado'],
    'Preparado': ['En camino', 'Cancelado'],
    'En camino': ['Entregado', 'Cancelado'],
    'Entregado': [],  // Un pedido entregado no puede cambiar[cite: 1]
    'Cancelado': []   // Un pedido cancelado no puede enviarse ni cambiar[cite: 1]
  };

  puedeTransicionarA(nuevoEstado) {
    const permitidos = Pedido.TRANSICIONES[this.estado] || [];
    return permitidos.includes(nuevoEstado);
  }
}

module.exports = Pedido;