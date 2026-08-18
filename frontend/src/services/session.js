const SESSION_KEY = 'redapro-session'

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) {
      return { id: 1, email: 'demo@redapro.com' }
    }

    const parsed = JSON.parse(raw)
    return {
      id: Number(parsed?.id) || 1,
      email: String(parsed?.email || 'demo@redapro.com'),
    }
  } catch {
    return { id: 1, email: 'demo@redapro.com' }
  }
}

export function setCurrentUser(user) {
  const nextUser = {
    id: Number(user?.id) || 1,
    email: String(user?.email || 'demo@redapro.com'),
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser))
  return nextUser
}

export function clearCurrentUser() {
  localStorage.removeItem(SESSION_KEY)
}

export function isAuthenticated() {
  try {
    return Boolean(localStorage.getItem(SESSION_KEY))
  } catch {
    return false
  }
}

export function getCurrentUserId() {
  return getCurrentUser().id
}
