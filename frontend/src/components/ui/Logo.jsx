import { Icon } from './Icon'
import styles from './Logo.module.css'

export function Logo({ compact = false }) {
  return (
    <div className={styles.logo}>
      <span className={styles.mark}><Icon name="edit" size={17} strokeWidth={2} /></span>
      {!compact && <span>Reda<span>Pro</span></span>}
    </div>
  )
}
