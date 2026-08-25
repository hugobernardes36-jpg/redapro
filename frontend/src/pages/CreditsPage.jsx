import { useEffect, useState } from 'react'
import { PageContainer } from '../components/ui/PageContainer'
import { PageHeader } from '../components/ui/PageHeader'
import { CreditSummary } from '../components/credits/CreditSummary'
import { CreditPackages } from '../components/credits/CreditPackages'
import { obterSaldoCreditos } from '../services/credits'

export function CreditsPage() {
  const [balance, setBalance] = useState(null)

  useEffect(() => {
    obterSaldoCreditos().then(setBalance).catch(() => setBalance(null))
  }, [])

  return (
    <PageContainer>
      <PageHeader 
        eyebrow="Créditos" 
        title="Seu saldo de créditos" 
        description="Gereneie seus créditos para realizar correções de redações e compre pacotes conforme necessário." 
      />
      <CreditSummary balance={balance} />
      <CreditPackages />
    </PageContainer>
  )
}