import { useState, useEffect } from 'react'
import { productosService, categoriasService, marcasService } from '../api/services'
import {
  PageHeader, Button, DataTable, Modal, Field,
  Badge, ConfirmDialog, SearchInput, Spinner
} from '../components/UI'
import { Box, Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = {
  codigoBarras: '', nombreProducto: '', descripcion: '',
  idCategoria: '', idMarca: '', precioCompra: '', precioVenta: '',
  stockActual: '', stockMinimo: '', estado: true,
}

const fmtC = v => `C$ ${Number(v || 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}`

export default function ProductosPage() {
  const [items, setItems] = useState([])
  const [cats, setCats] = useState([])
  const [marcas, setMarcas] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [p, c, m] = await Promise.all([
        productosService.getAll(),
        categoriasService.getAll(),
        marcasService.getAll(),
      ])
      setItems(p.data || [])
      setCats(c.data || [])
      setMarcas(m.data || [])
    } catch { toast.error('Error cargando datos') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const g = (obj, ...keys) => { for (const k of keys) { if (obj[k] !== undefined) return obj[k] } return null }

  const openCreate = () => { setEditData(null); setForm(EMPTY); setModal(true) }
  const openEdit = (p) => {
    setEditData(p)
    setForm({
      codigoBarras: g(p, 'codigoBarras', 'CodigoBarras') || '',
      nombreProducto: g(p, 'nombreProducto', 'NombreProducto') || '',
      descripcion: g(p, 'descripcion', 'Descripcion') || '',
      idCategoria: g(p, 'idCategoria', 'IdCategoria') || '',
      idMarca: g(p, 'idMarca', 'IdMarca') || '',
      precioCompra: g(p, 'precioCompra', 'PrecioCompra') || '',
      precioVenta: g(p, 'precioVenta', 'PrecioVenta') || '',
      stockActual: g(p, 'stockActual', 'StockActual') || '',
      stockMinimo: g(p, 'stockMinimo', 'StockMinimo') || '',
      estado: g(p, 'estado', 'Estado') ?? true,
    })
    setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.nombreProducto) { toast.error('El nombre es requerido'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        precioCompra: Number(form.precioCompra) || 0,
        precioVenta: Number(form.precioVenta) || 0,
        stockActual: Number(form.stockActual) || 0,
        stockMinimo: Number(form.stockMinimo) || 0,
        idCategoria: Number(form.idCategoria) || null,
        idMarca: Number(form.idMarca) || null,
      }
      if (editData) {
        await productosService.update(g(editData, 'idProducto', 'IdProducto'), payload)
        toast.success('Producto actualizado')
      } else {
        await productosService.create(payload)
        toast.success('Producto registrado')
      }
      setModal(false); load()
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await productosService.delete(confirm.id)
      toast.success('Producto eliminado'); setConfirm(null); load()
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'No se puede eliminar')
    } finally { setDeleting(false) }
  }

  const filtered = items.filter(p => {
    const q = search.toLowerCase()
    const nombre = (g(p, 'nombreProducto', 'NombreProducto') || '').toLowerCase()
    const codigo = (g(p, 'codigoBarras', 'CodigoBarras') || '').toLowerCase()
    return nombre.includes(q) || codigo.includes(q)
  })

  const columns = [
    { key: 'codigo', label: 'Código', render: r => g(r, 'codigoBarras', 'CodigoBarras') || '—' },
    { key: 'nombre', label: 'Producto', render: r => g(r, 'nombreProducto', 'NombreProducto') || '—' },
    {
      key: 'categoria', label: 'Categoría', render: r => {
        const id = g(r, 'idCategoria', 'IdCategoria')
        const cat = cats.find(c => (c.idCategoria || c.IdCategoria) == id)
        return cat ? (cat.nombreCategoria || cat.NombreCategoria) : '—'
      }
    },
    {
      key: 'marca', label: 'Marca', render: r => {
        const id = g(r, 'idMarca', 'IdMarca')
        const m = marcas.find(m => (m.idMarca || m.IdMarca) == id)
        return m ? (m.nombreMarca || m.NombreMarca) : '—'
      }
    },
    { key: 'precio', label: 'P. Venta', render: r => fmtC(g(r, 'precioVenta', 'PrecioVenta')), align: 'right' },
    {
      key: 'stock', label: 'Stock', render: r => {
        const s = g(r, 'stockActual', 'StockActual') || 0
        const min = g(r, 'stockMinimo', 'StockMinimo') || 0
        return <Badge color={s <= min ? 'red' : 'green'}>{s}</Badge>
      }, align: 'center'
    },
    {
      key: 'estado', label: 'Estado', render: r => {
        const est = g(r, 'estado', 'Estado')
        return <Badge color={est ? 'green' : 'gray'}>{est ? 'Activo' : 'Inactivo'}</Badge>
      }
    },
    {
      key: 'actions', label: '', nowrap: true,
      render: r => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil size={14} /></Button>
          <Button variant="ghost" size="sm" style={{ color: 'var(--danger)' }}
            onClick={() => setConfirm({ id: g(r, 'idProducto', 'IdProducto'), nombre: g(r, 'nombreProducto', 'NombreProducto') })}>
            <Trash2 size={14} />
          </Button>
        </div>
      )
    },
  ]

  return (
    <div style={{ maxWidth: 1200, animation: 'fadeIn 0.3s ease' }}>
      <PageHeader
        title="Inventario / Productos"
        subtitle={`${items.length} productos registrados`}
        actions={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar producto o código..." />
            <Button onClick={openCreate}><Plus size={15} /> Nuevo producto</Button>
          </>
        }
      />

      <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? <Spinner /> : (
          <DataTable columns={columns} data={filtered} emptyIcon={Box} emptyTitle="Sin productos" emptyDesc="Comienza registrando tu primer producto" />
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editData ? 'Editar producto' : 'Nuevo producto'} width={600}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <Field label="Código de Barras">
              <input value={form.codigoBarras} onChange={e => setForm(p => ({ ...p, codigoBarras: e.target.value }))} placeholder="82100000123" />
            </Field>
            <Field label="Nombre del producto" required>
              <input value={form.nombreProducto} onChange={e => setForm(p => ({ ...p, nombreProducto: e.target.value }))} placeholder="Nombre del artículo" />
            </Field>
          </div>
          <Field label="Descripción">
            <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} rows={2} placeholder="Descripción opcional..." style={{ resize: 'vertical' }} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <Field label="Categoría">
              <select value={form.idCategoria} onChange={e => setForm(p => ({ ...p, idCategoria: e.target.value }))}>
                <option value="">Sin categoría</option>
                {cats.map(c => <option key={c.idCategoria || c.IdCategoria} value={c.idCategoria || c.IdCategoria}>{c.nombreCategoria || c.NombreCategoria}</option>)}
              </select>
            </Field>
            <Field label="Marca">
              <select value={form.idMarca} onChange={e => setForm(p => ({ ...p, idMarca: e.target.value }))}>
                <option value="">Sin marca</option>
                {marcas.map(m => <option key={m.idMarca || m.IdMarca} value={m.idMarca || m.IdMarca}>{m.nombreMarca || m.NombreMarca}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <Field label="Precio de compra (C$)">
              <input type="number" step="0.01" min="0" value={form.precioCompra} onChange={e => setForm(p => ({ ...p, precioCompra: e.target.value }))} placeholder="0.00" />
            </Field>
            <Field label="Precio de venta (C$)" required>
              <input type="number" step="0.01" min="0" value={form.precioVenta} onChange={e => setForm(p => ({ ...p, precioVenta: e.target.value }))} placeholder="0.00" />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <Field label="Stock actual">
              <input type="number" min="0" value={form.stockActual} onChange={e => setForm(p => ({ ...p, stockActual: e.target.value }))} placeholder="0" />
            </Field>
            <Field label="Stock mínimo">
              <input type="number" min="0" value={form.stockMinimo} onChange={e => setForm(p => ({ ...p, stockMinimo: e.target.value }))} placeholder="0" />
            </Field>
          </div>
          <Field label="Estado">
            <select value={form.estado ? '1' : '0'} onChange={e => setForm(p => ({ ...p, estado: e.target.value === '1' }))}>
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>
          </Field>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{editData ? 'Guardar cambios' : 'Registrar producto'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm} onClose={() => setConfirm(null)} onConfirm={handleDelete}
        loading={deleting} title="Eliminar producto"
        message={`¿Eliminar "${confirm?.nombre}"? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
