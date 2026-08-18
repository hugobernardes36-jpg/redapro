import { Icon } from './Icon'
import styles from './Pagination.module.css'
export function Pagination(){return <div className={styles.pagination}><button><Icon name="chevron" size={15} className={styles.prev}/></button><button className={styles.current}>1</button><button>2</button><button><Icon name="chevron" size={15}/></button></div>}
