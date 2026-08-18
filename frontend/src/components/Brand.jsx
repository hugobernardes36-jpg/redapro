import { Icon } from './Icon'
import { navigate } from './navigation'
import styles from './Brand.module.css'

export function Brand() {
  return <button className={styles.brand} onClick={() => navigate('/inicio')} type="button">
    <span className={styles.logo}><Icon name="file" size={18} /></span><span>RedaPro</span>
  </button>
}
