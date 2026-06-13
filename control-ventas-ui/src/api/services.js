import api from './axios'

// ── AUTH ──────────────────────────────────────────────
export const authService = {
  login: (data) => api.post('/auth/login', data),
  registrar: (data) => api.post('/auth/registrar', data),
  menu: (rol) => api.get('/auth/menu', { params: { rol } }),
  listarUsuarios: () => api.get('/auth/usuarios'),
}

// ── CLIENTES ─────────────────────────────────────────
export const clientesService = {
  getAll: () => api.get('/clientes'),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  delete: (id) => api.delete(`/clientes/${id}`),
}

// ── PRODUCTOS / INVENTARIO ────────────────────────────
export const productosService = {
  getAll: () => api.get('/productos'),
  create: (data) => {
    const IdCategoriaNavigation = {}
    const IdMarcaNavigation = {}

    data = {...data, IdCategoriaNavigation, IdMarcaNavigation}
    api.post('/productos', data)
  },

  update: (id, data) => {
    const IdCategoriaNavigation = {}
    const IdMarcaNavigation = {}

    data = {...data, IdCategoriaNavigation, IdMarcaNavigation}
    api.put(`/productos/${id}`, data)
  },
  delete: (id) => api.delete(`/productos/${id}`),
}

// ── CATEGORÍAS ────────────────────────────────────────
export const categoriasService = {
  getAll: () => api.get('/categorias'),
  create: (data) => api.post('/categorias', data),
  update: (id, data) => api.put(`/categorias/${id}`, data),
  delete: (id) => api.delete(`/categorias/${id}`),
}

// ── MARCAS ────────────────────────────────────────────
export const marcasService = {
  getAll: () => api.get('/marcas'),
  create: (data) => api.post('/marcas', data),
  update: (id, data) => api.put(`/marcas/${id}`, data),
  delete: (id) => api.delete(`/marcas/${id}`),
}

// ── MÉTODOS DE PAGO ───────────────────────────────────
export const metodosPagoService = {
  getAll: () => api.get('/metodospago'),
  create: (data) => api.post('/metodospago', data),
  update: (id, data) => api.put(`/metodospago/${id}`, data),
}

// ── CAJAS ─────────────────────────────────────────────
export const cajasService = {
  getAll: () => api.get('/cajas'),
  create: (data) => api.post('/cajas', data),
}

// ── VENTAS ────────────────────────────────────────────
export const ventasService = {
  getAll: () => api.get('/ventas'),
  getById: (id) => api.get(`/ventas/${id}`),
  create: (data) => api.post('/ventas', data),
  anular: (id) => api.put(`/ventas/${id}/anular`),
}
