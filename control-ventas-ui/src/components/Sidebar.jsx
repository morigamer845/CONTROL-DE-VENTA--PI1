import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Home, Box, Users, UserCheck, ShoppingCart,
  ClipboardList, BarChart2, LogOut, Zap
} from 'lucide-react'

const ICON_MAP = {
  HomeIcon: Home,
  BoxIcon: Box,
  UsersIcon: Users,
  UserGroupIcon: UserCheck,
  ShoppingCartIcon: ShoppingCart,
  DocumentTextIcon: ClipboardList,
  ChartBarIcon: BarChart2,
}

export default function Sidebar() {
  const { user, menu, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside style={{
      width: 'var(--sidebar-width)', flexShrink: 0,
      background: 'var(--bg-surface)', borderRight: '1.5px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
      overflowY: 'auto', zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: 'var(--accent)', borderRadius: 'var(--radius-sm)',
            padding: '0.45rem', display: 'flex',
          }}>
            <Zap size={18} color="#fff" />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', lineHeight: 1.1, color: 'var(--text-primary)' }}>
              Control
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              de Ventas
            </p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div style={{ padding: '1rem 1.25rem 0.75rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.65rem',
          background: 'var(--bg-card)', borderRadius: 'var(--radius)',
          padding: '0.65rem 0.85rem',
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--accent)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700,
            color: '#fff', fontSize: '0.9rem', flexShrink: 0,
          }}>
            {user?.nombreCompleto?.charAt(0).toUpperCase() || '?'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontWeight: 500, fontSize: '0.8rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.nombreCompleto}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{user?.rol}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0 0.5rem', marginBottom: '0.35rem' }}>
          Menú
        </p>
        {menu.map((item) => {
          const Icon = ICON_MAP[item.icono] || Home
          return (
            <NavLink
              key={item.ruta}
              to={item.ruta}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)',
                textDecoration: 'none', fontSize: '0.86rem', fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-glow)' : 'transparent',
                transition: 'all var(--transition)',
                borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              })}
            >
              <Icon size={16} />
              {item.texto}
            </NavLink>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.65rem',
            padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)',
            width: '100%', background: 'transparent', border: 'none',
            color: 'var(--text-muted)', fontSize: '0.86rem', cursor: 'pointer',
            transition: 'all var(--transition)',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-bg)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
