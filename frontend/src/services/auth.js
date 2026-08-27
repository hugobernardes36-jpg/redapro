import { apiFetch } from './api'

export async function solicitarRedefinicaoSenha(email) {
  const response = await apiFetch('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.erro || 'Não foi possível processar a solicitação.')
  return data
}

export async function redefinirSenha(token, password) {
  const response = await apiFetch('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.erro || 'Não foi possível redefinir a senha.')
  return data
}