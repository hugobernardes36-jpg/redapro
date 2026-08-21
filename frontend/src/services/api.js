export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
let tokenGetter = null

export function configurarTokenGetter(getToken) {
  tokenGetter = getToken
}

function lerCookie(nome) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${nome}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

async function obterTokenCsrf() {
  const tokenNoCookie = lerCookie('redapro_csrf')
  if (tokenNoCookie) return tokenNoCookie

  const response = await fetch(`${API_BASE_URL}/api/auth/csrf`, {
    credentials: 'include',
  })
  const data = await response.json().catch(() => null)
  return response.ok ? data?.token : null
}

// Envia cookies de sessão (httpOnly) em toda requisição; nunca envie identidade do usuário manualmente.
// Para métodos de escrita, reenvia o token CSRF (double-submit cookie) exigido pelo backend.
export async function apiFetch(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const csrfToken = SAFE_METHODS.has(method) ? null : await obterTokenCsrf()
  const clerkToken = tokenGetter ? await tokenGetter() : null

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      ...(clerkToken ? { Authorization: `Bearer ${clerkToken}` } : {}),
    },
  })
}
