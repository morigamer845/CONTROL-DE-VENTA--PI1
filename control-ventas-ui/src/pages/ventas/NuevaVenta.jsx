import { useState, useEffect, useRef } from 'react'
import { clientesService, productosService, metodosPagoService, ventasService } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import { Button, Field, Badge, Spinner, Card } from '../../components/UI'
import { ShoppingCart, Plus, Minus, Trash2, Search, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const fmtC = v => `C$ ${Number(v || 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}`

export default function NuevaVentaPage() {
  const { user } = useAuth()
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [metodos, setMetodos] = useState([])
  const [loading, setLoading] = useState(true)

  // Venta state
  const [idCliente, setIdCliente] = useState('')
  const [idMetodoPago, setIdMetodoPago] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [carrito, setCarrito] = useState([])
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(null)

  // Búsqueda de producto
  const [searchProd, setSearchProd] = useState('')
  const [filteredProds, setFilteredProds] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropRef = useRef()

  useEffect(() => {
    const load = async () => {
      try {
        const [c, p, m] = await Promise.all([
          clientesService.getAll(),
          productosService.getAll(),
          metodosPagoService.getAll(),
        ])
        setClientes(c.data || [])
        setProductos((p.data || []).filter(x => (x.estado ?? x.Estado) !== false))
        setMetodos(m.data || [])
      } catch { toast.error('Error cargando datos') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const g = (obj, ...keys) => { for (const k of keys) if (obj[k] !== undefined) return obj[k]; return null }

  useEffect(() => {
    if (!searchProd.trim()) { setFilteredProds([]); setShowDropdown(false); return }
    const q = searchProd.toLowerCase()
    const res = productos.filter(p =>
      (g(p, 'nombreProducto', 'NombreProducto') || '').toLowerCase().includes(q) ||
      (g(p, 'codigoProducto', 'CodigoProducto') || '').toLowerCase().includes(q)
    ).slice(0, 8)
    setFilteredProds(res)
    setShowDropdown(res.length > 0)
  }, [searchProd, productos])

  const addToCart = (prod) => {
    const id = g(prod, 'idProducto', 'IdProducto')
    const stock = g(prod, 'stockActual', 'StockActual') || 0
    const precio = g(prod, 'precioVenta', 'PrecioVenta') || 0
    const nombre = g(prod, 'nombreProducto', 'NombreProducto') || ''

    setCarrito(prev => {
      const found = prev.find(x => x.idProducto === id)
      if (found) {
        if (found.cantidad >= stock) { toast.error('Stock insuficiente'); return prev }
        return prev.map(x => x.idProducto === id ? { ...x, cantidad: x.cantidad + 1 } : x)
      }
      if (stock < 1) { toast.error('Sin stock disponible'); return prev }
      return [...prev, { idProducto: id, nombre, precio: Number(precio), cantidad: 1, stock }]
    })
    setSearchProd(''); setShowDropdown(false)
  }

  const updateQty = (id, delta) => {
    setCarrito(prev => prev
      .map(x => x.idProducto === id ? { ...x, cantidad: Math.max(1, Math.min(x.stock, x.cantidad + delta)) } : x)
    )
  }

  const removeItem = (id) => setCarrito(prev => prev.filter(x => x.idProducto !== id))

  const subtotal = carrito.reduce((s, x) => s + x.precio * x.cantidad, 0)
  const total = subtotal // Si tienes impuesto, agrégalo aquí

  const handleVenta = async () => {
    if (carrito.length === 0) { toast.error('Agrega al menos un producto'); return }
    if (!idMetodoPago) { toast.error('Selecciona el método de pago'); return }
    setSaving(true)
    try {
      const payload = {
        idUsuario: user?.idUsuario,
        idCliente: idCliente ? Number(idCliente) : null,
        idMetodoPago: Number(idMetodoPago),
        observaciones,
        subtotal,
        total,
        detalles: carrito.map(x => ({
          idProducto: x.idProducto,
          cantidad: x.cantidad,
          precioUnitario: x.precio,
          subtotal: x.precio * x.cantidad,
        }))
      }
      const { data } = await ventasService.create(payload)
      setSuccess(data)
      setCarrito([]); setIdCliente(''); setIdMetodoPago(''); setObservaciones('')
      toast.success('¡Venta registrada con éxito!')
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al registrar la venta')
    } finally { setSaving(false) }
  }

  if (loading) return <Spinner label="Cargando POS..." />

  return (
    <div style={{ maxWidth: 1100, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>Nueva Venta</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
          Punto de venta · {user?.nombreCompleto}
        </p>
      </div>

      {success && (
        <div style={{
          background: 'var(--success-bg)', border: '1.5px solid var(--success)', borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
          animation: 'fadeIn 0.3s ease',
        }}>
          <CheckCircle size={22} style={{ color: 'var(--success)', flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 600, color: 'var(--success)' }}>Venta registrada exitosamente</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              ID de venta: #{success.idVenta || success.IdVenta || '—'} · Total: {fmtC(total)}
            </p>
          </div>
          <Button variant="ghost" size="sm" style={{ marginLeft: 'auto' }} onClick={() => setSuccess(null)}>✕</Button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', alignItems: 'start' }}>
        {/* Left - productos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Card>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '0.85rem', color: 'var(--text-secondary)' }}>
              Buscar y agregar productos
            </h3>
            <div style={{ position: 'relative' }} ref={dropRef}>
              <div style={{ position: 'relative' }}>
                <input
                  value={searchProd}
                  onChange={e => setSearchProd(e.target.value)}
                  placeholder="Nombre o código del producto..."
                  style={{ paddingLeft: '2.25rem' }}
                  onFocus={() => filteredProds.length > 0 && setShowDropdown(true)}
                />
                <Search size={15} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              </div>
              {showDropdown && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
                  background: 'var(--bg-card)', border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-card)',
                  marginTop: '0.35rem', overflow: 'hidden',
                }}>
                  {filteredProds.map(p => {
                    const id = g(p, 'idProducto', 'IdProducto')
                    const nombre = g(p, 'nombreProducto', 'NombreProducto') || ''
                    const precio = g(p, 'precioVenta', 'PrecioVenta') || 0
                    const stock = g(p, 'stockActual', 'StockActual') || 0
                    return (
                      <button
                        key={id}
                        onClick={() => addToCart(p)}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          width: '100%', padding: '0.65rem 1rem',
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--text-primary)', textAlign: 'left',
                          transition: 'background var(--transition)',
                          borderBottom: '1px solid var(--border)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{nombre}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stock: {stock}</p>
                        </div>
                        <span style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem' }}>
                          {fmtC(precio)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </Card>

          {/* Carrito */}
          <Card style={{ minHeight: 200 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingCart size={15} /> Carrito
              {carrito.length > 0 && <Badge color="blue">{carrito.length}</Badge>}
            </h3>
            {carrito.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>
                Busca y agrega productos arriba...
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {carrito.map(item => (
                  <div key={item.idProducto} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.65rem 0.85rem', background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.nombre}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fmtC(item.precio)} c/u</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button onClick={() => updateQty(item.idProducto, -1)}
                        style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Minus size={12} />
                      </button>
                      <span style={{ minWidth: 28, textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{item.cantidad}</span>
                      <button onClick={() => updateQty(item.idProducto, 1)}
                        style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <span style={{ minWidth: 80, textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>
                      {fmtC(item.precio * item.cantidad)}
                    </span>
                    <button onClick={() => removeItem(item.idProducto)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right - resumen */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '1rem' }}>
          <Card>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Datos de la venta
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Field label="Cliente">
                <select value={idCliente} onChange={e => setIdCliente(e.target.value)}>
                  <option value="">Cliente general</option>
                  {clientes.map(c => (
                    <option key={c.idCliente || c.IdCliente} value={c.idCliente || c.IdCliente}>
                      {`${c.nombres || c.Nombres || ''} ${c.apellidos || c.Apellidos || ''}`}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Método de pago" required>
                <select value={idMetodoPago} onChange={e => setIdMetodoPago(e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {metodos.map(m => {
                    const id = m.idMetodoPago || m.IdMetodoPago
                    const nombre = m.nombreMetodo || m.NombreMetodo || m.nombre || m.Nombre
                    return <option key={id} value={id}>{nombre}</option>
                  })}
                </select>
              </Field>
              <Field label="Observaciones">
                <textarea
                  value={observaciones}
                  onChange={e => setObservaciones(e.target.value)}
                  rows={2} placeholder="Notas adicionales..."
                  style={{ resize: 'none' }}
                />
              </Field>
            </div>
          </Card>

          {/* Total box */}
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>{fmtC(subtotal)}</span>
              </div>
              <div style={{ height: 1, background: 'var(--border)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>TOTAL</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--success)' }}>
                  {fmtC(total)}
                </span>
              </div>
            </div>
            <Button
              onClick={handleVenta}
              loading={saving}
              style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.75rem', fontSize: '0.9rem' }}
            >
              <ShoppingCart size={16} /> Registrar venta
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
