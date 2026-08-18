export const navItems = [
  { label: 'Início', path: '/inicio', icon: 'home' },
  { label: 'Nova Redação', path: '/nova-redacao', icon: 'plus' },
  { label: 'Minhas Redações', path: '/minhas-redacoes', icon: 'file' },
  { label: 'Temas', path: '/temas', icon: 'book' },
  { label: 'Perfil', path: '/perfil', icon: 'user' },
]

export function navigate(path) {
  window.dispatchEvent(new CustomEvent('redapro:navigate', { detail: path }))
}
