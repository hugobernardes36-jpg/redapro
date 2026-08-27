import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../services/api'
import { reenviarVerificacao as enviarVerificacao } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const carregarUsuario = useCallback(async () => {
    try {
      const response = await apiFetch('/api/auth/me')
      const data = response.ok ? await response.json() : null
      setUser(data?.usuario || null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarUsuario()
  }, [carregarUsuario])

  const login = useCallback(async (email, password) => {
    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data.erro || 'Não foi possível entrar.')
    }

    setUser(data.usuario || null)
    return data
  }, [])

  const register = useCallback(async (name, email, password) => {
    const response = await apiFetch('/api/auth/registrar', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data.erro || 'Não foi possível criar a conta.')
    }

    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' })
    } finally {
      setUser(null)
    }
  }, [])

  const reenviarVerificacao = useCallback(async (email) => {
    return enviarVerificacao(email)
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    reenviarVerificacao,
  }), [user, loading, login, register, logout, reenviarVerificacao])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
