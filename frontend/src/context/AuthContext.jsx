import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth as useClerkAuth, useUser } from '@clerk/react'
import { apiFetch, configurarTokenGetter } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { isLoaded, isSignedIn, getToken, signOut } = useClerkAuth()
  const { user: clerkUser } = useUser()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    configurarTokenGetter(getToken)
    return () => configurarTokenGetter(null)
  }, [getToken])

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      setUser(null)
      setLoading(false)
      return
    }

    let mounted = true
    apiFetch('/api/auth/me')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (mounted) setUser(data?.usuario || null) })
      .catch(() => { if (mounted) setUser(null) })
      .finally(() => { if (mounted) setLoading(false) })

    return () => { mounted = false }
  }, [isLoaded, isSignedIn])

  const logout = useCallback(async () => {
    try {
      await signOut()
    } finally {
      setUser(null)
    }
  }, [signOut])

  const reenviarVerificacao = useCallback(async () => {
    if (clerkUser?.primaryEmailAddress) {
      await clerkUser.primaryEmailAddress.prepareVerification({ strategy: 'email_code' })
    }
  }, [clerkUser])

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    logout,
    reenviarVerificacao,
    clerkUser,
  }), [user, loading, logout, reenviarVerificacao, clerkUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
