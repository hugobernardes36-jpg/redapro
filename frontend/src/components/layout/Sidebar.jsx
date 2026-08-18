import { Icon } from '../ui/Icon'
import { Logo } from '../ui/Logo'
import styles from './Sidebar.module.css'

const items = [
  ['Início', 'home', '/inicio'],
  ['Nova Redação', 'plus', '/nova-redacao'],
  ['Minhas Redações', 'file', '/minhas-redacoes'],
  ['Temas', 'book', '/temas'],
  ['Perfil', 'user', '/perfil'],
]

export function Sidebar({ currentPath, navigate, onLogout }) {
  const go = (to) => navigate(to)
  return <aside className={styles.sidebar}>
    <Logo />
    <nav className={styles.nav} aria-label="Navegação principal">
      {items.map(([label, icon, to]) => <button key={to} type="button" className={`${styles.item} ${currentPath === to ? styles.active : ''}`} onClick={() => go(to)}><Icon name={icon} size={18}/><span>{label}</span></button>)}
    </nav>
    <button className={styles.logout} type="button" onClick={() => (onLogout ? onLogout() : go('/login'))}><Icon name="logout" size={18}/><span>Sair</span></button>
  </aside>
}