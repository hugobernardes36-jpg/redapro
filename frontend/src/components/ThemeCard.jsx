import { Icon } from './Icon'
import styles from './ThemeCard.module.css'
export function ThemeCard({theme}){return <article className={styles.card}><div className={`${styles.icon} ${styles[theme.tone]}`}><Icon name="book" size={20}/></div><div><span className={styles.category}>{theme.category}</span><h2>{theme.title}</h2><p>{theme.description}</p></div><button className={styles.open} type="button"><Icon name="arrow" size={16}/></button></article>}
