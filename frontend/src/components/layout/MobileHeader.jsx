import { Icon } from '../ui/Icon'
import { Logo } from '../ui/Logo'
import styles from './MobileHeader.module.css'
import { CreditBalance } from '../credits/CreditBalance'

export function MobileHeader({ navigate, currentPath, onLogout }) {
  return (
    <header className={styles.header}>
      <button className={styles.menuButton} type="button" onClick={() => navigate('/perfil')} aria-label="Abrir perfil">
        <Icon name="user" size={18} />
      </button>

      <button className={styles.logoButton} type="button" onClick={() => navigate('/inicio')}>
        <Logo />
      </button>

      <button type="button" className={`${styles.icon} ${styles.primary}`} onClick={() => navigate('/nova-redacao')} aria-label="Nova redação">
        <Icon name="plus" size={18} />
      </button>
    </header>
  )
}