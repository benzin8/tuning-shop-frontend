import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin } from '../api/auth'
import { getMe } from '../api/users'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    getMe()
      .then(res => setUser(res.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (username, password) => {
    const res = await apiLogin(username, password)
    localStorage.setItem('token', res.data.access_token)
    const me = await getMe()
    setUser(me.data)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const isAdmin = user?.role?.role_name === 'admin'

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
