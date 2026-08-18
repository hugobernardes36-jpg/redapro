import { Icon } from './Icon'
import styles from './Toolbar.module.css'
export function Toolbar(){return <div className={styles.toolbar}><label className={styles.search}><Icon name="search" size={16}/><input placeholder="Buscar redação ou tema..." /></label><button className={styles.sort} type="button"><span>Ordenar: Mais recentes</span><Icon name="down" size={15}/></button><button className={styles.filter} type="button"><Icon name="filter" size={17}/></button></div>}
