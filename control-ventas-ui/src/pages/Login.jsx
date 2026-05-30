import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../api/services'
import { Button, Field } from '../components/UI'
import toast from 'react-hot-toast'
import { Zap, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      toast.error('Completa todos los campos')
      return
    }
    setLoading(true)
    try {
      const { data: userData } = await authService.login(form)
      const { data: menuData } = await authService.menu(userData.rol)

      // Normalize menu keys to camelCase for consistency
      const menuItems = menuData.map(m => ({
        texto: m.texto || m.Texto,
        ruta: m.ruta || m.Ruta,
        icono: m.icono || m.Icono,
      }))

      login(userData, menuItems)
      toast.success(`¡Bienvenido, ${userData.nombreCompleto}!`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al iniciar sesión'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: '1.5rem',
      backgroundImage: `
        radial-gradient(ellipse at 20% 30%, rgba(79,124,255,0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 70%, rgba(79,124,255,0.05) 0%, transparent 50%)
      `,
    }}>
      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'var(--bg-card)', border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '2.5rem',
        boxShadow: 'var(--shadow-card)',
        animation: 'fadeIn 0.4s ease',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 52, height: 52, background: 'var(--accent)',
            borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 1rem',
            boxShadow: '0 0 24px rgba(79,124,255,0.35)',
          }}>
            <Zap size={26} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.25rem' }}>
            Control de Ventas
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field label="Usuario" required>
            <input
              type="text"
              placeholder="Tu nombre de usuario"
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              autoComplete="username"
              autoFocus
            />
          </Field>

          <Field label="Contraseña" required>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                autoComplete="current-password"
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'none', border: 'none',
                  color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0,
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          <Button
            type="submit"
            loading={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.7rem' }}
          >
            Iniciar sesión
          </Button>
        </form>

        <div style={{
          marginTop: '1.5rem', padding: '1rem',
          background: 'rgba(79,124,255,0.06)', borderRadius: 'var(--radius)',
          border: '1px solid rgba(79,124,255,0.2)',
        }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            ¿No tienes cuenta? Contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  )
}
