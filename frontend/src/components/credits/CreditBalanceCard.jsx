import { useEffect, useState } from 'react'
import { Icon } from '../ui/Icon'
import { obterSaldoCreditos } from '../../services/credits'
import styles from './CreditBalanceCard.module.css'

export function CreditBalanceCard({ navigate }) {
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    obterSaldoCreditos()
      .then(setBalance)
      .catch(() => setBalance(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !balance) return null

  const total = balance.totalAvailable
  const isCritical = total === 0
  const isLow = total > 0 && total <= 5

  const statusClass = isCritical ? styles.critical : isLow ? styles.low : styles.healthy

  return (
    <article className={`${styles.card} ${statusClass}`} onClick={() => navigate('/creditos')}>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.label}>Correções disponíveis</span>
          <Icon name="spark" size={18} className={styles.icon} />
        </div>
        <div className={styles.value}>
          <strong>{total}</strong>
          <small>{total === 1 ? 'correção' : 'correções'}</small>
        </div>
        <p className={styles.description}>
          {isCritical
            ? 'Compre créditos para continuar'
            : isLow
            ? 'Saldo baixo. Compre mais em breve'
            : 'Você tem créditos suficientes'}
        </p>
      </div>
      <button type="button" className={styles.action} onClick={(e) => {
        e.stopPropagation()
        navigate('/creditos')
      }}>
        {isCritical ? 'Comprar' : 'Gerenciar'}
        <Icon name="arrowRight" size={14} />
      </button>
    </article>
  )
}
