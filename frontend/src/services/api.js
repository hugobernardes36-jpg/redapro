export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

function lerCookie(nome) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${nome}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

// Envia cookies de sessão (httpOnly) em toda requisição; nunca envie identidade do usuário manualmente.
// Para métodos de escrita, reenvia o token CSRF (double-submit cookie) exigido pelo backend.
export async function apiFetch(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const csrfToken = SAFE_METHODS.has(method) ? null : lerCookie('redapro_csrf')

  return fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })
}
