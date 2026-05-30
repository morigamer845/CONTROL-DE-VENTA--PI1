import { useState, useEffect } from 'react'
import { ventasService } from '../../api/services'
import {
  PageHeader, DataTable, Badge, Button,
  Modal, SearchInput, Spinner
} from '../../components/UI'
import { ClipboardList, Eye, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const fmtC = v => `C$ ${Number(v || 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}`
const fmtDate = d => {
  if (!d) return '—'
  return new Date(d).toLocaleString('es-NI', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const g = (obj, ...keys) => { for (const k of keys) if (obj?.[k] !== undefined) return obj[k]; return null }

export default function HistorialPage() {
  const [ventas, setVentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [detalle, setDetalle] = useState(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [confirmAnular, setConfirmAnular] = useState(null)
  const [anulando, setAnulando] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await ventasService.getAll()
      setVentas(data || [])
    } catch { toast.error('Error cargando historial') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const verDetalle = async (venta) => {
    const id = g(venta, 'idVenta', 'IdVenta')
    setLoadingDetalle(true)
    setDetalle({ loading: true, id })
    try {
      const { data } = await ventasService.getById(id)
      setDetalle(data)
    } catch {
      setDetalle(venta) // fallback to list data
    } finally { setLoadingDetalle(false) }
  }

  const handleAnular = async () => {
    if (!confirmAnular) return
    setAnulando(true)
    try {
      await ventasService.anular(confirmAnular.id)
      toast.success('Venta anulada')
      setConfirmAnular(null); load()
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al anular')
    } finally { setAnulando(false) }
  }

  const filtered = ventas.filter(v => {
    const q = search.toLowerCase()
    const id = String(g(v, 'idVenta', 'IdVenta') || '')
    return id.includes(q)
  })

  const columns = [
    { key: 'id', label: '# Venta', render: r => `#${g(r, 'idVenta', 'IdVenta')}`, nowrap: true },
    { key: 'fecha', label: 'Fecha', render: r => fmtDate(g(r, 'fechaVenta', 'FechaVenta')), nowrap: true },
    { key: 'cliente', label: 'Cliente', render: r => g(r, 'nombreCliente', 'NombreCliente') || g(r, 'idCliente', 'IdCliente') || 'General' },
    { key: 'usuario', label: 'Cajero', render: r => g(r, 'nombreUsuario', 'NombreUsuario') || g(r, 'idUsuario', 'IdUsuario') || '—' },
    { key: 'metodo', label: 'Pago', render: r => g(r, 'nombreMetodoPago', 'NombreMetodoPago') || '—' },
    {
      key: 'total', label: 'Total', align: 'right',
      render: r => <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--success)' }}>{fmtC(g(r, 'total', 'Total'))}</span>
    },
    {
      key: 'estado', label: 'Estado', render: r => {
        const est = g(r, 'estado', 'Estado') || 'COMPLETADA'
        const color = est === 'ANULADA' ? 'red' : est === 'PENDIENTE' ? 'yellow' : 'green'
        return <Badge color={color}>{est}</Badge>
      }
    },
    {
      key: 'actions', label: '', nowrap: true,
      render: r => {
        const est = g(r, 'estado', 'Estado') || 'COMPLETADA'
        return (
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <Button variant="ghost" size="sm" onClick={() => verDetalle(r)}><Eye size={14} /></Button>
            {est !== 'ANULADA' && (
              <Button variant="ghost" size="sm" style={{ color: 'var(--danger)' }}
                onClick={() => setConfirmAnular({ id: g(r, 'idVenta', 'IdVenta'), num: g(r, 'idVenta', 'IdVenta') })}>
                <AlertTriangle size={14} />
              </Button>
            )}
          </div>
        )
      }
    },
  ]

  return (
    <div style={{ maxWidth: 1150, animation: 'fadeIn 0.3s ease' }}>
      <PageHeader
        title="Historial de Ventas"
        subtitle={`${ventas.length} ventas registradas`}
        actions={<SearchInput value={search} onChange={setSearch} placeholder="Buscar por # de venta..." />}
      />

      <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? <Spinner /> : (
          <DataTable
            columns={columns}
            data={filtered}
            emptyIcon={ClipboardList}
            emptyTitle="Sin ventas"
            emptyDesc="Las ventas registradas aparecerán aquí"
          />
        )}
      </div>

      {/* Detalle Modal */}
      <Modal open={!!detalle} onClose={() => setDetalle(null)} title={`Detalle de venta #${g(detalle, 'idVenta', 'IdVenta') || '—'}`} width={600}>
        {detalle?.loading ? (
          <Spinner label="Cargando detalle..." />
        ) : detalle ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
              {[
                ['Fecha', fmtDate(g(detalle, 'fechaVenta', 'FechaVenta'))],
                ['Estado', g(detalle, 'estado', 'Estado') || 'COMPLETADA'],
                ['Cliente', g(detalle, 'nombreCliente', 'NombreCliente') || 'General'],
                ['Método de pago', g(detalle, 'nombreMetodoPago', 'NombreMetodoPago') || '—'],
                ['Subtotal', fmtC(g(detalle, 'subtotal', 'Subtotal'))],
                ['Total', fmtC(g(detalle, 'total', 'Total'))],
              ].map(([label, val]) => (
                <div key={label} style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.85rem' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>{label}</p>
                  <p style={{ fontWeight: 500 }}>{val}</p>
                </div>
              ))}
            </div>

            {/* Detalles de productos */}
            {(g(detalle, 'detalles', 'Detalles') || []).length > 0 && (
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Productos</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {(g(detalle, 'detalles', 'Detalles') || []).map((d, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                      <span>{g(d, 'nombreProducto', 'NombreProducto') || `Producto #${g(d, 'idProducto', 'IdProducto')}`} × {g(d, 'cantidad', 'Cantidad')}</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{fmtC(g(d, 'subtotal', 'Subtotal'))}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {g(detalle, 'observaciones', 'Observaciones') && (
              <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.85rem' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Observaciones</p>
                <p style={{ fontSize: '0.875rem' }}>{g(detalle, 'observaciones', 'Observaciones')}</p>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Confirm anular */}
      <Modal open={!!confirmAnular} onClose={() => setConfirmAnular(null)} title="Anular venta" width={400}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <AlertTriangle size={22} style={{ color: 'var(--warning)', flexShrink: 0 }} />
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              ¿Confirmas que deseas anular la venta #{confirmAnular?.num}? Esta acción no se puede deshacer y el stock será restaurado.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setConfirmAnular(null)}>Cancelar</Button>
            <Button variant="danger" onClick={handleAnular} loading={anulando}>Anular venta</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
