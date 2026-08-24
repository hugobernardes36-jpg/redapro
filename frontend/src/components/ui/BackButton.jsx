import { Icon } from './Icon'
import styles from './BackButton.module.css'

export function BackButton({ onClick, label = 'Voltar', to }) {
  const handleClick = onClick ?? (() => {
    if (to) {
      window.history.pushState({}, '', to)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  })

  return <button className={styles.back} type="button" onClick={handleClick}><Icon name="arrowLeft" size={18} /><span>{label}</span></button>
}