import { Icon } from './Icon'
import { navItems } from './navigation'
import styles from './BottomNav.module.css'

export function BottomNav({ currentPath, navigate }) {
  const active = currentPath || window.location.pathname.replace(/\/+$/, '') || '/inicio'

  return (
    <nav className={styles.nav} aria-label="Navegação móvel">
      {navItems.map((item) => (
        <button
          key={item.path}
          type="button"
          onClick={() => navigate(item.path)}
          className={`${styles.item} ${active === item.path ? styles.active : ''}`}
        >
          <Icon name={item.icon} size={18} />
          <span>{item.label.replace('Nova Redação', 'Nova').replace('Minhas Redações', 'Minhas')}</span>
        </button>
      ))}
    </nav>
  )
}
