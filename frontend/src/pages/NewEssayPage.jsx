import { useState } from 'react'
import { BackButton } from '../components/ui/BackButton'
import { PageHeader } from '../components/ui/PageHeader'
import { PageContainer } from '../components/ui/PageContainer'
import { EssayEditor } from '../components/essay/EssayEditor'
import { Icon } from '../components/ui/Icon'
import { criarRedacao, corrigirRedacao } from '../services/redacoes'
import styles from './NewEssayPage.module.css'

export function NewEssayPage({ navigate, setCorrectionResult }) {
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const initialTitle = new URLSearchParams(window.location.search).get('tema') || ''

  const submit = async ({ title, text }) => {
    setErro(null)
    setEnviando(true)
    try {
      const redacao = await criarRedacao({
        tema: title,
        texto: text,
      })

      const resultado = await corrigirRedacao(redacao.id)

      setCorrectionResult(resultado)
      navigate(`/resultado/${redacao.id}`)

    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <PageContainer>
      <BackButton onClick={() => navigate('/temas')} />
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

      {enviando ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <h2>Analisando sua redação...</h2>
          <p>A IA está avaliando seu texto nas 5 competências do ENEM. Isso pode levar alguns segundos.</p>
        </div>
      ) : (
        <EssayEditor onSubmit={submit} initialTitle={initialTitle} />
      )}
    </PageContainer>
  )
}