import { useState, useEffect } from 'react'
import { ventasService, clientesService, productosService } from '../../api/services'
import { Card, StatCard, Spinner } from '../../components/UI'
import { TrendingUp, Users, Package, DollarSign } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const fmtC = v => `C$ ${Number(v || 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}`
const g = (obj, ...keys) => { for (const k of keys) if (obj?.[k] !== undefined) return obj[k]; return null }

const TOOLTIP = {
  contentStyle: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)' },
  labelStyle: { color: 'var(--text-secondary)' },
}

const COLORS = ['#4f7cff', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4']

export default function ReportesPage() {
  const [ventas, setVentas] = useState([])
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [v, c, p] = await Promise.allSettled([
          ventasService.getAll(),
          clientesService.getAll(),
          productosService.getAll(),
        ])
        if (v.status === 'fulfilled') setVentas(v.value.data || [])
        if (c.status === 'fulfilled') setClientes(c.value.data || [])
        if (p.status === 'fulfilled') setProductos(p.value.data || [])
      } finally { setLoading(false) }
    }
    load()
  }, [])

  // --- Computed ---
  const totalVentas = ventas.reduce((s, v) => s + Number(g(v, 'total', 'Total') || 0), 0)
  const ventasActivas = ventas.filter(v => (g(v, 'estado', 'Estado') || '').toUpperCase() !== 'ANULADA')
  const ventasAnuladas = ventas.filter(v => (g(v, 'estado', 'Estado') || '').toUpperCase() === 'ANULADA')

  // Ventas por mes
  const ventasPorMes = (() => {
    const map = {}
    ventas.forEach(v => {
      const f = g(v, 'fechaVenta', 'FechaVenta')
      if (!f) return
      const d = new Date(f)
      const key = d.toLocaleDateString('es-NI', { month: 'short', year: '2-digit' })
      if (!map[key]) map[key] = { mes: key, total: 0, cantidad: 0 }
      map[key].total += Number(g(v, 'total', 'Total') || 0)
      map[key].cantidad += 1
    })
    return Object.values(map).slice(-6)
  })()

  // Top 5 productos por cantidad vendida
  const topProductos = (() => {
    const map = {}
    ventas.forEach(v => {
      const detalles = g(v, 'detalles', 'Detalles') || []
      detalles.forEach(d => {
        const nombre = g(d, 'nombreProducto', 'NombreProducto') || `#${g(d, 'idProducto', 'IdProducto')}`
        const qty = Number(g(d, 'cantidad', 'Cantidad') || 0)
        if (!map[nombre]) map[nombre] = { nombre, cantidad: 0, total: 0 }
        map[nombre].cantidad += qty
        map[nombre].total += Number(g(d, 'subtotal', 'Subtotal') || 0)
      })
    })
    return Object.values(map).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5)
  })()

  // Stock bajo
  const stockBajo = productos.filter(p => {
    const s = g(p, 'stock', 'Stock') || 0
    const min = g(p, 'stockMinimo', 'StockMinimo') || 0
    return s <= min
  })

  // Estado de ventas para pie
  const pieData = [
    { name: 'Completadas', value: ventasActivas.length },
    { name: 'Anuladas', value: ventasAnuladas.length },
  ].filter(x => x.value > 0)

  if (loading) return <Spinner label="Cargando reportes..." />

  return (
    <div style={{ maxWidth: 1200, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem' }}>Reportes Estadísticos</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Resumen general del negocio
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Ingresos totales" value={fmtC(totalVentas)} icon={DollarSign} color="blue" />
        <StatCard label="Ventas realizadas" value={ventasActivas.length} icon={TrendingUp} color="green" />
        <StatCard label="Clientes registrados" value={clientes.length} icon={Users} color="yellow" />
        <StatCard label="Productos con stock bajo" value={stockBajo.length} icon={Package} color="red" />
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <Card>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>
            Ingresos por mes
          </h3>
          {ventasPorMes.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={ventasPorMes}>
                <defs>
                  <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f7cff" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4f7cff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `C$${(v/1000).toFixed(0)}k`} />
                <Tooltip {...TOOLTIP} formatter={v => fmtC(v)} />
                <Area type="monotone" dataKey="total" stroke="#4f7cff" strokeWidth={2} fill="url(#gradIngresos)" name="Total" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>
            Estado de ventas
          </h3>
          {pieData.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip {...TOOLTIP} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <Card>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>
            Top productos más vendidos
          </h3>
          {topProductos.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>Sin datos de detalles</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topProductos} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="nombre" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip {...TOOLTIP} />
                <Bar dataKey="cantidad" fill="#22c55e" radius={[0, 4, 4, 0]} name="Unidades" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            Productos con stock bajo
          </h3>
          {stockBajo.length === 0 ? (
            <p style={{ color: 'var(--success)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>✓ Todos los productos tienen stock suficiente</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: 220, overflowY: 'auto' }}>
              {stockBajo.map((p, i) => {
                const nombre = g(p, 'nombreProducto', 'NombreProducto') || '—'
                const stock = g(p, 'stock', 'Stock') || 0
                const min = g(p, 'stockMinimo', 'StockMinimo') || 0
                return (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.5rem 0.75rem', background: 'var(--danger-bg)',
                    border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                  }}>
                    <span style={{ color: 'var(--text-primary)' }}>{nombre}</span>
                    <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{stock} / min {min}</span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
