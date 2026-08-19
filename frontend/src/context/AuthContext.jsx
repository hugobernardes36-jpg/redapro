import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    authService.obterUsuarioAtual()
      .then((usuario) => {
        if (mounted) setUser(usuario)
      })
      .catch(() => {
        if (mounted) setUser(null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const login = useCallback(async (credenciais) => {
    const usuario = await authService.login(credenciais)
    setUser(usuario)
    return usuario
  }, [])

  const registrar = useCallback(async (dados) => {
    const usuario = await authService.registrar(dados)
    setUser(usuario)
    return usuario
  }, [])

  const loginComGoogle = useCallback(async (idToken) => {
    const usuario = await authService.loginComGoogle(idToken)
    setUser(usuario)
    return usuario
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      setUser(null)
    }
  }, [])

  const reenviarVerificacao = useCallback(async () => {
    return authService.reenviarVerificacao()
  }, [])

  const esqueciSenha = useCallback(async (email) => {
    return authService.esqueciSenha(email)
  }, [])

  const redefinirSenha = useCallback(async (dados) => {
    return authService.redefinirSenha(dados)
  }, [])

  const verificarEmail = useCallback(async (token) => {
    const resultado = await authService.verificarEmail(token)
    const usuario = await authService.obterUsuarioAtual()
    if (usuario) setUser(usuario)
    return resultado
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    registrar,
    loginComGoogle,
    logout,
    reenviarVerificacao,
    esqueciSenha,
    redefinirSenha,
    verificarEmail,
  }), [user, loading, login, registrar, loginComGoogle, logout, reenviarVerificacao, esqueciSenha, redefinirSenha, verificarEmail])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
