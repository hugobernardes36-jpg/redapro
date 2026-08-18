import { Icon } from './Icon'
import { Brand } from './Brand'
import { navItems, navigate } from './navigation'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const active = window.location.pathname.replace(/\/+$/, '') || '/inicio'
  return <aside className={styles.sidebar}>
    <Brand />
    <nav className={styles.nav} aria-label="Navegação principal">
      {navItems.map(item => <button key={item.path} type="button"
        className={`${styles.item} ${active === item.path ? styles.active : ''}`}
        onClick={() => navigate(item.path)}>
        <Icon name={item.icon} size={18}/><span>{item.label}</span>
      </button>)}
    </nav>
    <button className={styles.logout} type="button"><Icon name="logout" size={18}/><span>Sair</span></button>
  </aside>
}
