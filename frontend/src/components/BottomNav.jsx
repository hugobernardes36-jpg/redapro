import { Icon } from './Icon'
import { navItems, navigate } from './navigation'
import styles from './BottomNav.module.css'

export function BottomNav(){
 const active=window.location.pathname.replace(/\/+$/,'')||'/inicio'
 return <nav className={styles.nav}>{navItems.map(i=><button key={i.path} onClick={()=>navigate(i.path)} className={`${styles.item} ${active===i.path?styles.active:''}`}><Icon name={i.icon} size={18}/><span>{i.label.replace('Nova Redação','Nova').replace('Minhas Redações','Minhas')}</span></button>)}</nav>
}
