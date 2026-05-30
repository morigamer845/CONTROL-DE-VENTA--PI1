import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { ventasService, clientesService, productosService } from '../api/services'
import { StatCard, Card } from '../components/UI'
import { ShoppingCart, Users, Package, TrendingUp, Clock } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts'

const fmtCurrency = v => `C$ ${Number(v || 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}`
const fmtDate = d => new Date(d).toLocaleDateString('es-NI', { day: '2-digit', month: 'short', year: 'numeric' })

const TOOLTIP_STYLE = {
  contentStyle: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: 'var(--text-secondary)' },
  itemStyle: { color: 'var(--accent)' },
}

export default function Dashboard() {
  const { user } = useAuth()
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
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Agrupar ventas por día (últimos 7 días)
  const ventasPorDia = (() => {
    const map = {}
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toLocaleDateString('es-NI', { weekday: 'short', day: '2-digit' })
      map[key] = 0
    }
    ventas.forEach(v => {
      const fecha = v.fechaVenta || v.FechaVenta
      if (!fecha) return
      const d = new Date(fecha)
      const now = new Date()
      const diffDays = Math.floor((now - d) / 86400000)
      if (diffDays < 7) {
        const key = d.toLocaleDateString('es-NI', { weekday: 'short', day: '2-digit' })
        if (map[key] !== undefined) {
          map[key] += Number(v.total || v.Total || 0)
        }
      }
    })
    return Object.entries(map).map(([dia, total]) => ({ dia, total }))
  })()

  const totalVentas = ventas.reduce((s, v) => s + Number(v.total || v.Total || 0), 0)
  const ventasHoy = ventas.filter(v => {
    const f = v.fechaVenta || v.FechaVenta
    if (!f) return false
    const d = new Date(f)
    const n = new Date()
    return d.toDateString() === n.toDateString()
  }).length

  const ultimasVentas = [...ventas]
    .sort((a, b) => new Date(b.fechaVenta || b.FechaVenta) - new Date(a.fechaVenta || a.FechaVenta))
    .slice(0, 5)

  return (
    <div style={{ maxWidth: 1200, animation: 'fadeIn 0.3s ease' }}>
      {/* Greeting */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.7rem', fontFamily: 'var(--font-display)' }}>
          Hola, {user?.nombreCompleto?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
          {new Date().toLocaleDateString('es-NI', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Ventas totales" value={fmtCurrency(totalVentas)} icon={TrendingUp} color="blue" />
        <StatCard label="Ventas hoy" value={ventasHoy} icon={ShoppingCart} color="green" />
        <StatCard label="Clientes" value={clientes.length} icon={Users} color="yellow" />
        <StatCard label="Productos" value={productos.length} icon={Package} color="red" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <Card>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>
            Ventas — últimos 7 días
          </h3>
          {loading ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Cargando…</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={ventasPorDia}>
                <defs>
                  <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f7cff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f7cff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="dia" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `C$${v}`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={v => fmtCurrency(v)} />
                <Area type="monotone" dataKey="total" stroke="#4f7cff" strokeWidth={2} fill="url(#gradVentas)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>
            Ventas por día (barras)
          </h3>
          {loading ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Cargando…</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ventasPorDia}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="dia" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `C$${v}`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={v => fmtCurrency(v)} />
                <Bar dataKey="total" fill="#4f7cff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Recent sales */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Clock size={16} style={{ color: 'var(--text-muted)' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Últimas ventas
          </h3>
        </div>
        {ultimasVentas.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>No hay ventas registradas todavía.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ultimasVentas.map((v, i) => {
              const fecha = v.fechaVenta || v.FechaVenta
              const total = v.total || v.Total
              const cliente = v.nombreCliente || v.NombreCliente || v.idCliente || '—'
              return (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.65rem 0.85rem', background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                }}>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>Venta #{v.idVenta || v.IdVenta}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fecha ? fmtDate(fecha) : '—'} · {cliente}</p>
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--success)' }}>
                    {fmtCurrency(total)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
