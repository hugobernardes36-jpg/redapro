import { useEffect, useState } from 'react'
import { Icon } from '../ui/Icon'
import { obterSaldoCreditos } from '../../services/credits'
import styles from './CreditBalance.module.css'

export function CreditBalance({ navigate, compact = false }) {
  const [balance, setBalance] = useState(null)
  const [changed, setChanged] = useState(false)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const nextBalance = await obterSaldoCreditos()
        if (mounted) setBalance(nextBalance)
      } catch {
        if (mounted) setBalance(null)
      }
    }

    function refresh() {
      setChanged(true)
      load()
      window.setTimeout(() => setChanged(false), 700)
    }

    load()
    window.addEventListener('credits:updated', refresh)
    return () => {
      mounted = false
      window.removeEventListener('credits:updated', refresh)
    }
  }, [])

  const total = balance?.totalAvailable
  const label = total === 1 ? 'correção disponível' : 'correções disponíveis'

  return (
    <button type="button" className={`${styles.balance} ${compact ? styles.compact : ''} ${total === 0 ? styles.empty : ''} ${changed ? styles.changed : ''}`} onClick={() => navigate('/creditos')} aria-label={total === undefined ? 'Consultar correções disponíveis' : `${total} ${label}`}>
      <Icon name="spark" size={compact ? 15 : 17} />
      <span className={styles.content}>
        <strong>{total === undefined ? '—' : total}</strong>
        <small>{total === undefined ? 'correções' : label}</small>
      </span>
    </button>
  )
}
