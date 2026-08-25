import { Icon } from '../ui/Icon'
import styles from './MobileNav.module.css'

const items = [['Início','home','/inicio'],['Nova','plus','/nova-redacao'],['Minhas','file','/minhas-redacoes'],['Temas','book','/temas'],['Créditos','spark','/creditos'],['Perfil','user','/perfil']]

export function MobileNav({ currentPath, navigate }) {
 return <nav className={styles.nav} aria-label="Navegação mobile">{items.map(([label,icon,to])=><button key={to} type="button" className={`${styles.item} ${currentPath===to?styles.active:''}`} onClick={()=>navigate(to)}><Icon name={icon} size={18}/><span>{label}</span></button>)}</nav>
}