import { Icon } from './Icon'
import { Brand } from './Brand'
import { navigate } from './navigation'
import styles from './MobileHeader.module.css'

export function MobileHeader() {
 return <header className={styles.header}><button className={styles.icon} type="button"><Icon name="menu"/></button><Brand/><button className={`${styles.icon} ${styles.primary}`} onClick={()=>navigate('/nova-redacao')} type="button"><Icon name="plus"/></button></header>
}
