import { Icon } from '../ui/Icon'
import styles from './EssayCard.module.css'

function formatStatus(status) {
 const normalized = String(status || '').trim().toUpperCase()

 if (normalized === 'NAO_APTA') return 'Não apta'
 if (normalized === 'CORRIGIDA') return 'Corrigida'
 if (normalized === 'PENDENTE') return 'Pendente'

 return status || 'Pendente'
}

export function EssayCard({ essay, onOpen }) {
 return <article className={styles.card}><div className={`${styles.icon} ${styles[essay.tone]}`}><Icon name="file" size={20}/></div><div className={styles.content}><h3>{essay.title}</h3><div className={styles.meta}><span>{essay.date}</span><i>•</i><span className={styles.status}>{formatStatus(essay.status)}</span></div></div><div className={styles.score}><strong>{essay.score}</strong><small>/1000</small></div><button className={styles.open} type="button" onClick={()=>onOpen?.(essay)} aria-label={`Visualizar ${essay.title}`}><Icon name="arrowRight" size={17}/></button></article>
}