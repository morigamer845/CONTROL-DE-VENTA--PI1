import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'

// Pages
import LoginPage from './pages/Login'
import Dashboard from './pages/Dashboard'
import ClientesPage from './pages/Clientes'
import ProductosPage from './pages/Productos'
import UsuariosPage from './pages/Usuarios'
import NuevaVentaPage from './pages/ventas/NuevaVenta'
import HistorialPage from './pages/ventas/Historial'
import ReportesPage from './pages/ventas/Reportes'

// 404
function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'var(--border)' }}>404</p>
      <p style={{ color: 'var(--text-secondary)' }}>Página no encontrada</p>
      <a href="/dashboard" style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>← Ir al inicio</a>
    </div>
  )
}

// Guard for admin-only pages
function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.rol !== 'Administrador') return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

      {/* Protected */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/ventas/nueva" element={<NuevaVentaPage />} />
        <Route path="/ventas/historial" element={<HistorialPage />} />

        {/* Admin only */}
        <Route path="/productos" element={<AdminRoute><ProductosPage /></AdminRoute>} />
        <Route path="/usuarios" element={<AdminRoute><UsuariosPage /></AdminRoute>} />
        <Route path="/reportes" element={<AdminRoute><ReportesPage /></AdminRoute>} />
      </Route>

      {/* Default */}
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
