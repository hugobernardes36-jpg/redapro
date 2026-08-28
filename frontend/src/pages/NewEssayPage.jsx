import { useCallback, useEffect, useRef, useState } from 'react'
import { BackButton } from '../components/ui/BackButton'
import { PageHeader } from '../components/ui/PageHeader'
import { PageContainer } from '../components/ui/PageContainer'
import { EssayEditor } from '../components/essay/EssayEditor'
import { enviarRedacaoParaCorrecao } from '../services/redacoes'
import { obterSaldoCreditos } from '../services/credits'
import { getSafeBackPath } from '../utils/navigation'
import { CreditPackages } from '../components/credits/CreditPackages'
import styles from './NewEssayPage.module.css'

export function NewEssayPage({ navigate, setCorrectionResult }) {
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [semCreditos, setSemCreditos] = useState(false)
  const [retomandoPagamento, setRetomandoPagamento] = useState(false)
  const [rascunho, setRascunho] = useState(() => {
    try {
      const saved = sessionStorage.getItem('redapro:pending-essay')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const retomadaIniciada = useRef(false)
  const initialTitle = new URLSearchParams(window.location.search).get('tema') || ''

  useEffect(() => {
    if (!enviando) return undefined

    let active = true
    async function refreshBalanceWhileProcessing() {
      try {
        await obterSaldoCreditos()
        if (active) window.dispatchEvent(new Event('credits:updated'))
      } catch {
        // A correção continua sob controle do backend mesmo se uma atualização visual falhar.
      }
    }

    refreshBalanceWhileProcessing()
    const interval = window.setInterval(refreshBalanceWhileProcessing, 1000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [enviando])

  const submit = useCallback(async ({ title, text }) => {
    setErro(null)
    setSemCreditos(false)
    setEnviando(true)
    try {
      const resultado = await enviarRedacaoParaCorrecao({
        tema: title,
        texto: text,
      })

      setCorrectionResult(resultado)
      sessionStorage.removeItem('redapro:pending-essay')
      window.dispatchEvent(new Event('credits:updated'))
      navigate(`/resultado/${resultado.redacaoId}`)

    } catch (err) {
      if (err.code === 'CREDITOS_INSUFICIENTES' || err.status === 402) {
        const pendingEssay = { title, text }
        sessionStorage.setItem('redapro:pending-essay', JSON.stringify(pendingEssay))
        setRascunho(pendingEssay)
        setSemCreditos(true)
      } else {
        setSemCreditos(false)
        setErro(err.message)
      }
    } finally {
      setEnviando(false)
    }
  }, [navigate, setCorrectionResult])

  useEffect(() => {
    const payment = new URLSearchParams(window.location.search).get('payment')
    if (payment !== 'success' || !rascunho || retomadaIniciada.current) return

    retomadaIniciada.current = true
    let cancelled = false
    setRetomandoPagamento(true)
    setSemCreditos(false)

    async function waitForConfirmedCredit() {
      for (let attempt = 0; attempt < 15; attempt += 1) {
        try {
          const balance = await obterSaldoCreditos()
          if (balance.totalAvailable > 0) {
            if (!cancelled) await submit(rascunho)
            return
          }
        } catch {
          // A próxima consulta tenta novamente sem presumir que a compra foi aprovada.
        }
        await new Promise((resolve) => window.setTimeout(resolve, 2000))
      }

      if (!cancelled) {
        setRetomandoPagamento(false)
        setErro('O pagamento foi recebido, mas o crédito ainda está sendo confirmado. Tente enviar a redação novamente em instantes.')
      }
    }

    waitForConfirmedCredit()
    return () => {
      cancelled = true
    }
  }, [rascunho, submit])

  const mostrarPacotes = semCreditos && !enviando && !retomandoPagamento

  return (
    <PageContainer>
      <BackButton to={getSafeBackPath(window.location.pathname)} onClick={() => navigate(getSafeBackPath(window.location.pathname))} />
      <PageHeader
        eyebrow="Produção"
        title="Nova Redação"
        description="Escolha um tema, escreva com calma e envie quando estiver pronto."
      />
      <div className={styles.tip}>
        <b>Antes de começar</b>
        <span>Organize sua tese, desenvolva argumentos consistentes e lembre-se da proposta de intervenção.</span>
      </div>
      {erro && <div className={styles.erro}>{erro}</div>}

      {mostrarPacotes && (
        <CreditPackages title="Você ficou sem correções" />
      )}

      {retomandoPagamento || enviando ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <h2>{retomandoPagamento ? 'Confirmando seu crédito...' : 'Analisando sua redação...'}</h2>
          <p>{retomandoPagamento ? 'Estamos aguardando a confirmação segura do pagamento. Sua redação será enviada automaticamente.' : 'A IA está avaliando seu texto nas 5 competências do ENEM. Isso pode levar alguns segundos.'}</p>
        </div>
      ) : !semCreditos ? (
        <EssayEditor onSubmit={submit} initialTitle={rascunho?.title || initialTitle} initialText={rascunho?.text || ''} />
      ) : null
      }
    </PageContainer>
  )
}