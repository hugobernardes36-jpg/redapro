import { Icon } from '../ui/Icon'
import styles from './CreditSummary.module.css'

export function CreditSummary({ balance }) {
  if (!balance) return null

  const total = balance.totalAvailable
  const isCritical = total === 0
  const isLow = total > 0 && total <= 5
  const isHealthy = total > 5

  const statusClass = isCritical ? styles.critical : isLow ? styles.low : styles.healthy
  
  return (
    <section className={`${styles.summary} ${statusClass}`}>
      <div className={styles.container}>
        <div className={styles.iconWrapper}>
          <Icon name="spark" size={40} />
        </div>
        
        <div className={styles.content}>
          <p className={styles.label}>Seu saldo de créditos</p>
          <div className={styles.balance}>
            <strong className={styles.number}>{total}</strong>
            <span className={styles.unit}>
              {total === 1 ? 'correção' : 'correções'}
            </span>
          </div>
          <p className={styles.description}>
            {isCritical
              ? 'Você não tem créditos disponíveis. Compre um pacote para continuar.'
              : isLow
              ? 'Você tem poucos créditos restantes. Considere comprar mais em breve.'
              : 'Você tem créditos suficientes para realizar correções.'}
          </p>
        </div>
      </div>

      {balance.freeRemaining > 0 && (
        <div className={styles.details}>
          <div className={styles.detail}>
            <span className={styles.detailLabel}>Gratuitas restantes</span>
            <strong className={styles.detailValue}>{balance.freeRemaining}</strong>
          </div>
          <div className={styles.detail}>
            <span className={styles.detailLabel}>Créditos pagos</span>
            <strong className={styles.detailValue}>{balance.paidCredits}</strong>
          </div>
        </div>
      )}
    </section>
  )
}
