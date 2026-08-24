import { useEffect, useState } from 'react'
import { BackButton } from '../components/ui/BackButton'
import { PageContainer } from '../components/ui/PageContainer'
import { PageHeader } from '../components/ui/PageHeader'
import { buscarRedacao } from '../services/redacoes'
import { getSafeBackPath } from '../utils/navigation'
import styles from './EssayDetailsPage.module.css'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR')
}

function formatStatus(status) {
  const normalized = String(status || '').trim().toUpperCase()

  if (normalized === 'NAO_APTA') return 'Não apta'
  if (normalized === 'CORRIGIDA') return 'Corrigida'
  if (normalized === 'PENDENTE') return 'Pendente'

  return status || 'Pendente'
}

export function EssayDetailsPage({ navigate, selectedEssayId, essayId }) {
  const [essay, setEssay] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const resolvedEssayId = selectedEssayId ?? essayId

  useEffect(() => {
    if (!resolvedEssayId) {
      setLoading(false)
      setEssay(null)
      return
    }

    async function load() {
      try {
        const data = await buscarRedacao(resolvedEssayId)
        setEssay(data)
        setErro(null)
      } catch (err) {
        setErro(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [resolvedEssayId])

  if (loading) {
    return <PageContainer><BackButton to={getSafeBackPath(window.location.pathname)} onClick={() => navigate(getSafeBackPath(window.location.pathname))} /><div className={styles.loadingState}>Carregando...</div></PageContainer>
  }

  if (erro || !essay) {
    return (
      <PageContainer>
        <BackButton to={getSafeBackPath(window.location.pathname)} onClick={() => navigate(getSafeBackPath(window.location.pathname))} />
        <div className={styles.loadingState}>{erro || 'Redação não encontrada.'}</div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <BackButton to={getSafeBackPath(window.location.pathname)} onClick={() => navigate(getSafeBackPath(window.location.pathname))} />
      <PageHeader
        eyebrow="Redação"
        title={essay.tema}
        description={`${formatDate(essay.createdAt)} · ${formatStatus(essay.status)}`}
      />
      <div className={styles.grid}>
        <article className={styles.text}>
          <h2>Texto da redação</h2>
          <p>{essay.texto}</p>
        </article>
        <aside className={styles.summary}>
          <span>Nota</span>
          <strong>{essay.notaFinal ?? '—'}</strong>
          <small>/1000</small>
          {essay.correcao && (
            <button type="button" onClick={() => navigate(`/resultado/${essay.id}`)}>
              Ver correção completa
            </button>
          )}
        </aside>
      </div>
    </PageContainer>
  )
}