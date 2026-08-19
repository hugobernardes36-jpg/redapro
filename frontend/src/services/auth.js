import { apiFetch } from './api'

async function parseResponse(response) {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.erro || 'Ocorreu um erro. Tente novamente.')
  }

  return payload
}

export async function registrar({ name, email, password }) {
  const response = await apiFetch('/api/auth/registrar', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })

  const data = await parseResponse(response)
  return data.usuario
}

export async function login({ email, password }) {
  const response = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  const data = await parseResponse(response)
  return data.usuario
}

export async function loginComGoogle(idToken) {
  const response = await apiFetch('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  })

  const data = await parseResponse(response)
  return data.usuario
}

export async function logout() {
  const response = await apiFetch('/api/auth/logout', { method: 'POST' })
  return parseResponse(response)
}

export async function obterUsuarioAtual() {
  const response = await apiFetch('/api/auth/me')

  if (response.status === 401) {
    return null
  }

  const data = await parseResponse(response)
  return data.usuario
}

export async function verificarEmail(token) {
  const response = await apiFetch('/api/auth/verificar-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  })
  return parseResponse(response)
}

export async function reenviarVerificacao() {
  const response = await apiFetch('/api/auth/reenviar-verificacao', { method: 'POST' })
  return parseResponse(response)
}

export async function esqueciSenha(email) {
  const response = await apiFetch('/api/auth/esqueci-senha', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
  return parseResponse(response)
}

export async function redefinirSenha({ token, password }) {
  const response = await apiFetch('/api/auth/redefinir-senha', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  })
  return parseResponse(response)
}
