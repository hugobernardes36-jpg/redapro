import { Icon } from '../ui/Icon'
import { Logo } from '../ui/Logo'
import styles from './MobileHeader.module.css'

export function MobileHeader({ navigate }) {
 return <header className={styles.header}><span className={styles.spacer} aria-hidden="true"/><button className={styles.logoButton} type="button" onClick={()=>navigate('/inicio')}><Logo/></button><button type="button" className={`${styles.icon} ${styles.primary}`} onClick={()=>navigate('/nova-redacao')} aria-label="Nova redação"><Icon name="plus" size={19}/></button></header>
}