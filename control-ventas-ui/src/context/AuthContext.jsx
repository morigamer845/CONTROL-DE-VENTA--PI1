import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cv_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  const [menu, setMenu] = useState(() => {
    try {
      const stored = localStorage.getItem('cv_menu')
      return stored ? JSON.parse(stored) : []
    } catch { return [] }
  })

  const login = (userData, menuItems) => {
    setUser(userData)
    setMenu(menuItems)
    localStorage.setItem('cv_user', JSON.stringify(userData))
    localStorage.setItem('cv_menu', JSON.stringify(menuItems))
  }

  const logout = () => {
    setUser(null)
    setMenu([])
    localStorage.removeItem('cv_user')
    localStorage.removeItem('cv_menu')
  }

  return (
    <AuthContext.Provider value={{ user, menu, login, logout, isAdmin: user?.rol === 'Administrador' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
