import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'

export default function Layout() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar />
      <main style={{
        flex: 1, overflowY: 'auto', minWidth: 0,
        padding: '2rem',
        background: 'var(--bg-base)',
      }}>
        <Outlet />
      </main>
    </div>
  )
}
