import { useState, useEffect } from 'react'
import { clientesService } from '../api/services'
import {
  PageHeader, Button, DataTable, Modal, Field,
  Badge, ConfirmDialog, SearchInput, Spinner, EmptyState
} from '../components/UI'
import { Users, Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  numDocumento: '', nombres: '', apellidos: '',
  telefono: '', direccion: '', email: ''
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await clientesService.getAll()
      setClientes(data || [])
    } catch { toast.error('Error al cargar clientes') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditData(null); setForm(EMPTY_FORM); setModal(true) }
  const openEdit = (c) => {
    setEditData(c)
    setForm({
      numDocumento: c.numDocumento || c.NumDocumento || '',
      nombres: c.nombres || c.Nombres || '',
      apellidos: c.apellidos || c.Apellidos || '',
      telefono: c.telefono || c.Telefono || '',
      direccion: c.direccion || c.Direccion || '',
      email: c.email || c.Email || '',
    })
    setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.nombres || !form.apellidos) { toast.error('Nombre y apellidos son requeridos'); return }
    setSaving(true)
    try {
      if (editData) {
        const id = editData.idCliente || editData.IdCliente
        await clientesService.update(id, form)
        toast.success('Cliente actualizado')
      } else {
        await clientesService.create(form)
        toast.success('Cliente registrado')
      }
      setModal(false); load()
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await clientesService.delete(confirm.id)
      toast.success('Cliente eliminado')
      setConfirm(null); load()
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'No se puede eliminar')
    } finally { setDeleting(false) }
  }

  const filtered = clientes.filter(c => {
    const q = search.toLowerCase()
    const nombre = `${c.nombres || c.Nombres || ''} ${c.apellidos || c.Apellidos || ''}`.toLowerCase()
    const doc = (c.numDocumento || c.NumDocumento || '').toLowerCase()
    return nombre.includes(q) || doc.includes(q)
  })

  const columns = [
    { key: 'doc', label: 'Documento', render: r => r.numDocumento || r.NumDocumento || '—' },
    { key: 'nombre', label: 'Nombre completo', render: r => `${r.nombres || r.Nombres || ''} ${r.apellidos || r.Apellidos || ''}` },
    { key: 'tel', label: 'Teléfono', render: r => r.telefono || r.Telefono || '—' },
    { key: 'email', label: 'Email', render: r => r.email || r.Email || '—' },
    { key: 'dir', label: 'Dirección', render: r => r.direccion || r.Direccion || '—' },
    {
      key: 'actions', label: 'Acciones', nowrap: true,
      render: r => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil size={14} /></Button>
          <Button variant="ghost" size="sm" style={{ color: 'var(--danger)' }}
            onClick={() => setConfirm({ id: r.idCliente || r.IdCliente, nombre: `${r.nombres || r.Nombres} ${r.apellidos || r.Apellidos}` })}>
            <Trash2 size={14} />
          </Button>
        </div>
      )
    },
  ]

  return (
    <div style={{ maxWidth: 1100, animation: 'fadeIn 0.3s ease' }}>
      <PageHeader
        title="Clientes"
        subtitle={`${clientes.length} clientes registrados`}
        actions={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o doc..." />
            <Button onClick={openCreate}><Plus size={15} /> Nuevo cliente</Button>
          </>
        }
      />

      <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? <Spinner /> : (
          <DataTable
            columns={columns}
            data={filtered}
            emptyIcon={Users}
            emptyTitle="No hay clientes"
            emptyDesc="Agrega tu primer cliente usando el botón superior"
          />
        )}
      </div>

      {/* Modal Crear/Editar */}
      <Modal open={modal} onClose={() => setModal(false)} title={editData ? 'Editar cliente' : 'Nuevo cliente'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <Field label="Nombres" required>
              <input value={form.nombres} onChange={e => setForm(p => ({ ...p, nombres: e.target.value }))} placeholder="Ej: Juan Carlos" />
            </Field>
            <Field label="Apellidos" required>
              <input value={form.apellidos} onChange={e => setForm(p => ({ ...p, apellidos: e.target.value }))} placeholder="Ej: García López" />
            </Field>
          </div>
          <Field label="Número de documento">
            <input value={form.numDocumento} onChange={e => setForm(p => ({ ...p, numDocumento: e.target.value }))} placeholder="Cédula o RUC" />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <Field label="Teléfono">
              <input value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))} placeholder="8888-0000" />
            </Field>
            <Field label="Email">
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="correo@ejemplo.com" />
            </Field>
          </div>
          <Field label="Dirección">
            <input value={form.direccion} onChange={e => setForm(p => ({ ...p, direccion: e.target.value }))} placeholder="Barrio, calle..." />
          </Field>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{editData ? 'Guardar cambios' : 'Registrar cliente'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Eliminar cliente"
        message={`¿Estás seguro de que deseas eliminar a "${confirm?.nombre}"? Si tiene ventas asociadas no podrá eliminarse.`}
      />
    </div>
  )
}
