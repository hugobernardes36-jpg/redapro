import { useEffect, useState } from 'react'
import { PageContainer } from '../components/ui/PageContainer'
import { PageHeader } from '../components/ui/PageHeader'
import { CreditPackages } from '../components/credits/CreditPackages'
import { obterSaldoCreditos } from '../services/credits'
import styles from './CreditsPage.module.css'

export function CreditsPage() {
  const [balance, setBalance] = useState(null)

  useEffect(() => {
    obterSaldoCreditos().then(setBalance).catch(() => setBalance(null))
  }, [])

  const availableLabel = balance?.totalAvailable === 1 ? 'correção disponível' : 'correções disponíveis'

  return (
    <PageContainer>
      <PageHeader eyebrow="Créditos" title="Suas correções" description="Acompanhe seu saldo e compre correções quando precisar." />
      {balance && (
        <>
          <p className={styles.summary}>Você possui <strong>{balance.totalAvailable}</strong> {availableLabel}.</p>
          <section className={styles.balance}>
          <div><span>Correções gratuitas restantes</span><strong>{balance.freeRemaining}</strong></div>
          <div><span>Créditos disponíveis</span><strong>{balance.paidCredits}</strong></div>
          <div><span>Total disponível</span><strong>{balance.totalAvailable}</strong></div>
          </section>
        </>
      )}
      <CreditPackages />
    </PageContainer>
  )
}