import { useEffect, useState } from 'react'
import { listarPacotesCreditos } from '../../services/credits'
import { iniciarCheckout } from '../../services/payments'
import styles from './CreditPackages.module.css'

function formatPrice(amountCents) {
  return (amountCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function CreditPackages({ title = 'Escolha um pacote para continuar' }) {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    listarPacotesCreditos().then(setPackages).catch((err) => setError(err.message)).finally(() => setLoading(false))
  }, [])

  async function handleCheckout(packageId) {
    setSelected(packageId)
    setError(null)
    try {
      await iniciarCheckout(packageId)
    } catch (err) {
      setError(err.message)
      setSelected(null)
    }
  }

  if (loading) return <div className={styles.state}>Carregando pacotes...</div>
  if (error && packages.length === 0) return <div className={styles.error}>{error}</div>

  return (
    <section className={styles.wrapper}>
      <div className={styles.heading}>
        <span>CRÉDITOS</span>
        <h2>{title}</h2>
      </div>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.grid}>
        {packages.map((item) => (
          <article className={`${styles.package} ${item.recommended ? styles.recommended : ''}`} key={item.id}>
            {item.recommended && <small>Recomendado</small>}
            <strong>{item.label}</strong>
            <span>{formatPrice(item.amountCents)}</span>
            <em>{formatPrice(Math.round(item.amountCents / item.credits))} por correção</em>
            <button type="button" onClick={() => handleCheckout(item.id)} disabled={selected !== null}>
              {selected === item.id ? 'Abrindo checkout...' : 'Comprar'}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
