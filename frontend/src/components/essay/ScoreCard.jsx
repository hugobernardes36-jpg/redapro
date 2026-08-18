import { Icon } from '../ui/Icon'
import styles from './ScoreCard.module.css'
export function ScoreCard({ score }) {
 return <div className={styles.card}><div><span>Nota final</span><strong>{score}</strong><small>/1000</small></div><div className={styles.badge}><Icon name="chart" size={16}/><span>Bom desempenho</span></div></div>
}