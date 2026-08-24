export function normalizeAppPath(path) {
  if (!path) return '/'

  const parsed = new URL(path, window.location.origin)
  const pathname = parsed.pathname || '/'
  return pathname.replace(/\/+$/, '') || '/'
}

export function getSafeBackPath(pathname) {
  const current = normalizeAppPath(pathname)

  if (current === '/resultado' || current.startsWith('/resultado/')) {
    return '/minhas-redacoes'
  }

  if (current === '/redacao' || current.startsWith('/redacao/')) {
    return '/minhas-redacoes'
  }

  if (current === '/nova-redacao') {
    return '/temas'
  }

  if (current === '/temas' || current === '/perfil' || current === '/minhas-redacoes') {
    return '/inicio'
  }

  if (current === '/login' || current === '/cadastro') {
    return '/'
  }

  return '/inicio'
}
