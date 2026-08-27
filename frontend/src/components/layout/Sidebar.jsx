import { Icon } from '../ui/Icon'
import { Logo } from '../ui/Logo'
import styles from './Sidebar.module.css'
import { CreditBalance } from '../credits/CreditBalance'

const items = [
  ['Início', 'home', '/inicio'],
  ['Nova Redação', 'plus', '/nova-redacao'],
  ['Minhas Redações', 'file', '/minhas-redacoes'],
  ['Temas', 'book', '/temas'],
  ['Créditos', 'spark', '/creditos'],
  ['Perfil', 'user', '/perfil'],
]

export function Sidebar({ currentPath, navigate, onLogout }) {
  const go = (to) => navigate(to)

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brandWrap}>
        <Logo />
      </div>

      <div className={styles.balanceWrap}>
        <CreditBalance navigate={navigate} />
      </div>

      <nav className={styles.nav} aria-label="Navegação principal">
        {items.map(([label, icon, to]) => (
          <button
            key={to}
            type="button"
            className={`${styles.item} ${currentPath === to ? styles.active : ''}`}
            onClick={() => go(to)}
          >
            <span className={styles.iconBox}><Icon name={icon} size={16} /></span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <button className={styles.logout} type="button" onClick={() => (onLogout ? onLogout() : go('/login'))}>
        <span className={styles.iconBox}><Icon name="logout" size={16} /></span>
        <span>Sair</span>
      </button>
    </aside>
  )
}