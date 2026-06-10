import { useState, useEffect, useCallback } from 'react'
import {
  categoriasService,
  marcasService,
  metodosPagoService,
  cajasService,
} from '../api/services'
import {
  Button, DataTable, Modal, Field,
  Badge, ConfirmDialog, SearchInput, Spinner, PageHeader, Card
} from '../components/UI'
import {
  Tag, Bookmark, CreditCard, Archive,
  Plus, Pencil, Trash2, Settings,
} from 'lucide-react'
import toast from 'react-hot-toast'

/* ─── helper: lee propiedades PascalCase o camelCase ─── */
const g = (obj, ...keys) => {
  for (const k of keys) if (obj?.[k] !== undefined) return obj[k]
  return null
}

/* ══════════════════════════════════════════════════════════
   TABS de configuración
══════════════════════════════════════════════════════════ */
const TABS = [
  { id: 'categorias',    label: 'Categorías',        icon: Tag        },
  { id: 'marcas',        label: 'Marcas',             icon: Bookmark   },
  { id: 'metodosPago',   label: 'Métodos de Pago',   icon: CreditCard },
  { id: 'cajas',         label: 'Cajas',              icon: Archive    },
]

/* ══════════════════════════════════════════════════════════
   SUB-COMPONENTE GENÉRICO: mini-CRUD reutilizable
   Recibe: service, columns, emptyForm, buildForm, renderForm
══════════════════════════════════════════════════════════ */
function CrudSection({ service, getId, columns, emptyForm, renderForm, entityName, searchFn }) {
  const [rows, setRows]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [modal, setModal]       = useState(false)
  const [editData, setEditData] = useState(null)
  const [form, setForm]         = useState(emptyForm)
  const [saving, setSaving]     = useState(false)
  const [confirm, setConfirm]   = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await service.getAll()
      setRows(data || [])
    } catch { toast.error(`Error cargando ${entityName}`) }
    finally { setLoading(false) }
  }, [service, entityName])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditData(null); setForm(emptyForm); setModal(true) }
  const openEdit   = (row) => { setEditData(row); setForm(emptyForm); setModal(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editData) {
        await service.update(getId(editData), form)
        toast.success(`${entityName} actualizado`)
      } else {
        await service.create(form)
        toast.success(`${entityName} creado`)
      }
      setModal(false); load()
    } catch (err) {
      toast.error(err.response?.data?.mensaje || `Error al guardar ${entityName}`)
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await service.delete(confirm.id)
      toast.success(`${entityName} eliminado`)
      setConfirm(null); load()
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'No se puede eliminar')
    } finally { setDeleting(false) }
  }

  const filtered = searchFn ? rows.filter(r => searchFn(r, search)) : rows

  /* columnas con botones de acción inyectados automáticamente */
  const fullColumns = [
    ...columns,
    {
      key: '_actions', label: '', nowrap: true,
      render: (r) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
            <Pencil size={14} />
          </Button>
          {service.delete && (
            <Button variant="ghost" size="sm" style={{ color: 'var(--danger)' }}
              onClick={() => setConfirm({ id: getId(r), label: confirm?.label })}>
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {searchFn && (
          <SearchInput value={search} onChange={setSearch} placeholder={`Buscar ${entityName.toLowerCase()}...`} />
        )}
        <Button onClick={openCreate} style={{ marginLeft: 'auto' }}>
          <Plus size={15} /> Nuevo {entityName}
        </Button>
      </div>

      {/* tabla */}
      <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading
          ? <Spinner />
          : <DataTable columns={fullColumns} data={filtered} emptyTitle={`Sin ${entityName.toLowerCase()}s`} />
        }
      </div>

      {/* modal crear/editar */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editData ? `Editar ${entityName}` : `Nuevo ${entityName}`}
        width={480}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {renderForm({ form, setForm, editData })}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>
              {editData ? 'Guardar cambios' : `Crear ${entityName}`}
            </Button>
          </div>
        </form>
      </Modal>

      {/* confirmación eliminar */}
      {service.delete && (
        <ConfirmDialog
          open={!!confirm}
          onClose={() => setConfirm(null)}
          onConfirm={handleDelete}
          loading={deleting}
          title={`Eliminar ${entityName}`}
          message={`¿Estás seguro de que deseas eliminar este registro? Si tiene datos asociados en el sistema, la operación será rechazada.`}
        />
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   SECCIÓN: CATEGORÍAS
══════════════════════════════════════════════════════════ */
function SeccionCategorias() {
  const columns = [
    { key: 'nombre',     label: 'Nombre',      render: r => g(r, 'nombreCategoria', 'NombreCategoria') || '—' },
    { key: 'desc',       label: 'Descripción', render: r => g(r, 'descripcion', 'Descripcion') || '—' },
    {
      key: 'estado', label: 'Estado',
      render: r => {
        const e = g(r, 'estado', 'Estado')
        return <Badge color={e !== false && e !== 0 ? 'green' : 'gray'}>{e !== false && e !== 0 ? 'Activa' : 'Inactiva'}</Badge>
      },
    },
  ]

  const emptyForm = { nombreCategoria: '', descripcion: '', estado: true }

  const renderForm = ({ form, setForm, editData }) => {
    // pre-cargar valores al abrir edición
    useEffect(() => {
      if (editData) {
        setForm({
          nombreCategoria: g(editData, 'nombreCategoria', 'NombreCategoria') || '',
          descripcion:     g(editData, 'descripcion',     'Descripcion')     || '',
          estado:          g(editData, 'estado',          'Estado') ?? true,
        })
      }
    }, [editData]) // eslint-disable-line

    return (
      <>
        <Field label="Nombre de la categoría" required>
          <input
            value={form.nombreCategoria}
            onChange={e => setForm(p => ({ ...p, nombreCategoria: e.target.value }))}
            placeholder="Ej: Repuestos de motor"
            autoFocus
          />
        </Field>
        <Field label="Descripción">
          <textarea
            value={form.descripcion}
            onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
            rows={2} placeholder="Descripción opcional..."
            style={{ resize: 'vertical' }}
          />
        </Field>
        <Field label="Estado">
          <select
            value={form.estado ? '1' : '0'}
            onChange={e => setForm(p => ({ ...p, estado: e.target.value === '1' }))}
          >
            <option value="1">Activa</option>
            <option value="0">Inactiva</option>
          </select>
        </Field>
      </>
    )
  }

  return (
    <CrudSection
      service={categoriasService}
      getId={r => g(r, 'idCategoria', 'IdCategoria')}
      columns={columns}
      emptyForm={emptyForm}
      renderForm={renderForm}
      entityName="Categoría"
      searchFn={(r, q) => (g(r, 'nombreCategoria', 'NombreCategoria') || '').toLowerCase().includes(q.toLowerCase())}
    />
  )
}

/* ══════════════════════════════════════════════════════════
   SECCIÓN: MARCAS
══════════════════════════════════════════════════════════ */
function SeccionMarcas() {
  const columns = [
    { key: 'nombre', label: 'Marca', render: r => g(r, 'nombreMarca', 'NombreMarca') || '—' },
  ]

  const emptyForm = { nombreMarca: '' }

  const renderForm = ({ form, setForm, editData }) => {
    useEffect(() => {
      if (editData) setForm({ nombreMarca: g(editData, 'nombreMarca', 'NombreMarca') || '' })
    }, [editData]) // eslint-disable-line

    return (
      <Field label="Nombre de la marca" required>
        <input
          value={form.nombreMarca}
          onChange={e => setForm(p => ({ ...p, nombreMarca: e.target.value }))}
          placeholder="Ej: Honda, Castrol, Yamaha..."
          autoFocus
        />
      </Field>
    )
  }

  return (
    <CrudSection
      service={marcasService}
      getId={r => g(r, 'idMarca', 'IdMarca')}
      columns={columns}
      emptyForm={emptyForm}
      renderForm={renderForm}
      entityName="Marca"
      searchFn={(r, q) => (g(r, 'nombreMarca', 'NombreMarca') || '').toLowerCase().includes(q.toLowerCase())}
    />
  )
}

/* ══════════════════════════════════════════════════════════
   SECCIÓN: MÉTODOS DE PAGO
══════════════════════════════════════════════════════════ */

/* Servicio extendido con delete para esta sección */
import api from '../api/axios'
const metodosPagoServiceConDelete = {
  ...metodosPagoService,
  delete: (id) => api.delete(`/metodospago/${id}`),
}

function SeccionMetodosPago() {
  /* Columnas adaptadas a cualquier serialización del backend */
  const columns = [
    {
      key: 'nombre', label: 'Método de pago',
      render: r =>
        g(r, 'nombreMetodo', 'NombreMetodo') ||
        g(r, 'nombre',       'Nombre')       ||
        g(r, 'descripcion',  'Descripcion')  || '—',
    },
    {
      key: 'estado', label: 'Estado',
      render: r => {
        const e = g(r, 'estado', 'Estado')
        if (e === undefined || e === null) return <Badge color="blue">Activo</Badge>
        return <Badge color={e ? 'green' : 'gray'}>{e ? 'Activo' : 'Inactivo'}</Badge>
      },
    },
  ]

  const emptyForm = { nombreMetodo: '', descripcion: '', estado: true }

  const renderForm = ({ form, setForm, editData }) => {
    useEffect(() => {
      if (editData) {
        setForm({
          nombreMetodo: g(editData, 'nombreMetodo', 'NombreMetodo') || g(editData, 'nombre', 'Nombre') || '',
          descripcion:  g(editData, 'descripcion',  'Descripcion')  || '',
          estado:       g(editData, 'estado',        'Estado') ?? true,
        })
      }
    }, [editData]) // eslint-disable-line

    return (
      <>
        <Field label="Nombre del método" required>
          <input
            value={form.nombreMetodo}
            onChange={e => setForm(p => ({ ...p, nombreMetodo: e.target.value }))}
            placeholder="Ej: Efectivo C$, Transferencia, Tarjeta..."
            autoFocus
          />
        </Field>
        <Field label="Descripción">
          <input
            value={form.descripcion}
            onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
            placeholder="Descripción opcional..."
          />
        </Field>
        <Field label="Estado">
          <select
            value={form.estado ? '1' : '0'}
            onChange={e => setForm(p => ({ ...p, estado: e.target.value === '1' }))}
          >
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
          </select>
        </Field>
      </>
    )
  }

  return (
    <CrudSection
      service={metodosPagoServiceConDelete}
      getId={r => g(r, 'idMetodoPago', 'IdMetodoPago') ?? g(r, 'id', 'Id')}
      columns={columns}
      emptyForm={emptyForm}
      renderForm={renderForm}
      entityName="Método de pago"
      searchFn={(r, q) => {
        const nombre = (
          g(r, 'nombreMetodo', 'NombreMetodo') ||
          g(r, 'nombre', 'Nombre') || ''
        ).toLowerCase()
        return nombre.includes(q.toLowerCase())
      }}
    />
  )
}

/* ══════════════════════════════════════════════════════════
   SECCIÓN: CAJAS
══════════════════════════════════════════════════════════ */

/* El backend solo expone GET y POST para cajas, sin PUT ni DELETE.
   Aquí usamos un servicio parcial. */
const cajasServiceLocal = {
  getAll:  cajasService.getAll,
  create:  cajasService.create,
  update:  async (id, data) => api.put(`/cajas/${id}`, data),
  // delete no implementado en el backend original → omitido
}

function SeccionCajas() {
  const [rows, setRows]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [editData, setEditData] = useState(null)
  const [form, setForm]         = useState({ nombreCaja: '', descripcion: '' })
  const [saving, setSaving]     = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await cajasService.getAll()
      setRows(data || [])
    } catch { toast.error('Error cargando cajas') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditData(null); setForm({ nombreCaja: '', descripcion: '' }); setModal(true) }
  const openEdit   = (row) => {
    setEditData(row)
    setForm({
      nombreCaja:  g(row, 'nombreCaja', 'NombreCaja')   || '',
      descripcion: g(row, 'descripcion','Descripcion')   || '',
    })
    setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.nombreCaja.trim()) { toast.error('El nombre de la caja es requerido'); return }
    setSaving(true)
    try {
      if (editData) {
        await cajasServiceLocal.update(g(editData, 'idCaja', 'IdCaja'), form)
        toast.success('Caja actualizada')
      } else {
        await cajasService.create(form)
        toast.success('Caja creada')
      }
      setModal(false); load()
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al guardar la caja')
    } finally { setSaving(false) }
  }

  const estadoColor = (e) => {
    if (!e) return 'gray'
    const s = String(e).toUpperCase()
    if (s === 'ABIERTA') return 'green'
    if (s === 'CERRADA') return 'yellow'
    return 'gray'
  }

  const columns = [
    { key: 'id',     label: '#',          render: r => g(r, 'idCaja',     'IdCaja')     || '—' },
    { key: 'nombre', label: 'Nombre',     render: r => g(r, 'nombreCaja', 'NombreCaja') || '—' },
    { key: 'desc',   label: 'Descripción',render: r => g(r, 'descripcion','Descripcion')|| '—' },
    {
      key: 'estado', label: 'Estado',
      render: r => {
        const e = g(r, 'estado', 'Estado') || 'CERRADA'
        return <Badge color={estadoColor(e)}>{e}</Badge>
      },
    },
    {
      key: '_actions', label: '', nowrap: true,
      render: r => (
        <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
          <Pencil size={14} />
        </Button>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex' }}>
        <Button onClick={openCreate} style={{ marginLeft: 'auto' }}>
          <Plus size={15} /> Nueva caja
        </Button>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? <Spinner /> : <DataTable columns={columns} data={rows} emptyTitle="Sin cajas registradas" />}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editData ? 'Editar caja' : 'Nueva caja'} width={420}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <Field label="Nombre de la caja" required>
            <input
              value={form.nombreCaja}
              onChange={e => setForm(p => ({ ...p, nombreCaja: e.target.value }))}
              placeholder="Ej: Caja 1, Caja Principal..."
              autoFocus
            />
          </Field>
          <Field label="Descripción">
            <input
              value={form.descripcion}
              onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
              placeholder="Descripción opcional..."
            />
          </Field>
          <div style={{
            padding: '0.75rem',
            background: 'var(--warning-bg)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            color: 'var(--warning)',
          }}>
            ℹ️ Las cajas nuevas nacen en estado <strong>CERRADA</strong> automáticamente.
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{editData ? 'Guardar cambios' : 'Crear caja'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL: Configuración
══════════════════════════════════════════════════════════ */
export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('categorias')

  const CurrentSection = {
    categorias:  SeccionCategorias,
    marcas:      SeccionMarcas,
    metodosPago: SeccionMetodosPago,
    cajas:       SeccionCajas,
  }[activeTab]

  return (
    <div style={{ maxWidth: 1000, animation: 'fadeIn 0.3s ease' }}>
      <PageHeader
        title="Configuración"
        subtitle="Administra los catálogos del sistema"
      />

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0.25rem',
        background: 'var(--bg-surface)', border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '0.35rem',
        marginBottom: '1.5rem', flexWrap: 'wrap',
      }}>
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1rem', borderRadius: 'var(--radius)',
                border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '0.86rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#fff' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent)' : 'transparent',
                transition: 'all var(--transition)',
                boxShadow: isActive ? '0 2px 8px rgba(79,124,255,0.3)' : 'none',
                flex: '1 1 auto',
                justifyContent: 'center',
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Panel activo */}
      <Card style={{ padding: '1.25rem' }}>
        {/* Header del panel */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          {(() => {
            const tab = TABS.find(t => t.id === activeTab)
            const Icon = tab?.icon || Settings
            return (
              <>
                <div style={{
                  background: 'var(--accent-glow)', padding: '0.45rem',
                  borderRadius: 'var(--radius-sm)', display: 'flex',
                }}>
                  <Icon size={17} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>{tab?.label}</h2>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                    {activeTab === 'categorias'  && 'Clasifica tus productos por categorías'}
                    {activeTab === 'marcas'       && 'Gestiona las marcas de tus productos'}
                    {activeTab === 'metodosPago'  && 'Define las formas de pago disponibles en ventas'}
                    {activeTab === 'cajas'        && 'Registra y administra las cajas de cobro'}
                  </p>
                </div>
              </>
            )
          })()}
        </div>

        <CurrentSection />
      </Card>
    </div>
  )
}
