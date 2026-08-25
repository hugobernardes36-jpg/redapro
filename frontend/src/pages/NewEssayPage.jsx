import { useState } from 'react'
import { BackButton } from '../components/ui/BackButton'
import { PageHeader } from '../components/ui/PageHeader'
import { PageContainer } from '../components/ui/PageContainer'
import { EssayEditor } from '../components/essay/EssayEditor'
import { enviarRedacaoParaCorrecao } from '../services/redacoes'
import { getSafeBackPath } from '../utils/navigation'
import { CreditPackages } from '../components/credits/CreditPackages'
import styles from './NewEssayPage.module.css'

export function NewEssayPage({ navigate, setCorrectionResult }) {
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [semCreditos, setSemCreditos] = useState(false)
  const initialTitle = new URLSearchParams(window.location.search).get('tema') || ''

  const submit = async ({ title, text }) => {
    setErro(null)
    setSemCreditos(false)
    setEnviando(true)
    try {
      const resultado = await enviarRedacaoParaCorrecao({
        tema: title,
        texto: text,
      })

      setCorrectionResult(resultado)
      window.dispatchEvent(new Event('credits:updated'))
      navigate(`/resultado/${resultado.redacaoId}`)

    } catch (err) {
      if (err.code === 'CREDITOS_INSUFICIENTES') {
        setSemCreditos(true)
      } else {
        setErro(err.message)
      }
    } finally {
      setEnviando(false)
    }
  }

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

      {semCreditos && (
        <CreditPackages title="Você ficou sem correções" />
      )}

      {enviando ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <h2>Analisando sua redação...</h2>
          <p>A IA está avaliando seu texto nas 5 competências do ENEM. Isso pode levar alguns segundos.</p>
        </div>
      ) : !semCreditos ? (
        <EssayEditor onSubmit={submit} initialTitle={initialTitle} />
      ) : null
      }
    </PageContainer>
  )
}