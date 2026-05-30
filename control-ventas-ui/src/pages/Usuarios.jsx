import { useState, useEffect } from 'react'
import { authService } from '../api/services'
import {
  PageHeader, Button, DataTable, Modal, Field,
  Badge, SearchInput, Spinner
} from '../components/UI'
import { Users, Plus, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { idRol: 1, username: '', password: '', nombres: '', apellidos: '', email: '' }
const ROLES = [{ id: 1, nombre: 'Administrador' }, { id: 2, nombre: 'Cajero' }]

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await authService.listarUsuarios()
      setUsuarios(data || [])
    } catch { toast.error('Error al cargar usuarios') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password || !form.nombres || !form.apellidos || !form.email) {
      toast.error('Todos los campos son requeridos')
      return
    }
    setSaving(true)
    try {
      await authService.registrar(form)
      toast.success('Usuario registrado con éxito')
      setModal(false); setForm(EMPTY); load()
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al registrar')
    } finally { setSaving(false) }
  }

  const filtered = usuarios.filter(u => {
    const q = search.toLowerCase()
    const nombre = `${u.nombres || ''} ${u.apellidos || ''}`.toLowerCase()
    return nombre.includes(q) || (u.username || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
  })

  const columns = [
    { key: 'username', label: 'Usuario', render: r => r.username || r.Username },
    { key: 'nombre', label: 'Nombre completo', render: r => `${r.nombres || ''} ${r.apellidos || ''}` },
    { key: 'email', label: 'Email', render: r => r.email || '—' },
    {
      key: 'rol', label: 'Rol', render: r => {
        const rol = r.nombreRol || r.NombreRol || '—'
        return <Badge color={rol === 'Administrador' ? 'blue' : 'yellow'}>{rol}</Badge>
      }
    },
    {
      key: 'estado', label: 'Estado', render: r => {
        const e = r.estado ?? r.Estado
        return <Badge color={e ? 'green' : 'gray'}>{e ? 'Activo' : 'Inactivo'}</Badge>
      }
    },
  ]

  return (
    <div style={{ maxWidth: 1000, animation: 'fadeIn 0.3s ease' }}>
      <PageHeader
        title="Gestión de Usuarios"
        subtitle={`${usuarios.length} usuarios en el sistema`}
        actions={
          <>
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar usuario..." />
            <Button onClick={() => { setForm(EMPTY); setModal(true) }}><Plus size={15} /> Nuevo usuario</Button>
          </>
        }
      />

      <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? <Spinner /> : (
          <DataTable columns={columns} data={filtered} emptyIcon={Users} emptyTitle="Sin usuarios" emptyDesc="Registra el primer usuario del sistema" />
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Nuevo usuario" width={520}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <Field label="Rol" required>
            <select value={form.idRol} onChange={e => setForm(p => ({ ...p, idRol: Number(e.target.value) }))}>
              {ROLES.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <Field label="Nombres" required>
              <input value={form.nombres} onChange={e => setForm(p => ({ ...p, nombres: e.target.value }))} placeholder="Juan Carlos" />
            </Field>
            <Field label="Apellidos" required>
              <input value={form.apellidos} onChange={e => setForm(p => ({ ...p, apellidos: e.target.value }))} placeholder="García López" />
            </Field>
          </div>
          <Field label="Email" required>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="correo@empresa.com" />
          </Field>
          <Field label="Nombre de usuario" required>
            <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder="usuario123" autoComplete="off" />
          </Field>
          <Field label="Contraseña" required>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                style={{ paddingRight: '2.75rem' }}
              />
              <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Registrar usuario</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
