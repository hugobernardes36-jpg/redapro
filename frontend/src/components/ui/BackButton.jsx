import { Icon } from './Icon'
import styles from './BackButton.module.css'

export function BackButton({ onClick, label = 'Voltar' }) {
  return <button className={styles.back} type="button" onClick={onClick}><Icon name="arrowLeft" size={18} /><span>{label}</span></button>
}