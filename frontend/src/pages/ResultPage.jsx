import { useEffect, useState } from 'react'
import { BackButton } from '../components/ui/BackButton'
import { PageHeader } from '../components/ui/PageHeader'
import { PageContainer } from '../components/ui/PageContainer'
import { ScoreCard } from '../components/essay/ScoreCard'
import { CompetencyCard } from '../components/essay/CompetencyCard'
import { buscarRedacao } from '../services/redacoes'
import styles from './ResultPage.module.css'

const competencyLabels = {
  competencia1: { id: 'C1', title: 'Domínio da modalidade escrita' },
  competencia2: { id: 'C2', title: 'Compreensão da proposta' },
  competencia3: { id: 'C3', title: 'Seleção e organização de informações' },
  competencia4: { id: 'C4', title: 'Coesão' },
  competencia5: { id: 'C5', title: 'Proposta de intervenção' },
}

function mapRejectReason(motivo) {
  const mensagens = {
    'Redação em branco.': 'A redação está em branco.',
    'Texto da redação não informado.': 'A redação não foi informada corretamente.',
    'Texto muito curto para uma redação do ENEM.': 'A redação está muito curta para ser avaliada.',
    fuga_ao_tema: 'A redação fugiu do tema proposto.',
    texto_sem_sentido: 'O texto não apresenta sentido e coerência suficientes para uma correção.',
    texto_insuficiente: 'A redação não possui desenvolvimento suficiente para ser corrigida.',
    nao_dissertativo_argumentativo: 'A redação não tem estrutura dissertativo-argumentativa adequada.',
    conteudo_inadequado: 'O conteúdo da redação não atende aos critérios mínimos para correção.',
  }

  return mensagens[motivo] || 'A redação não atende aos critérios mínimos para correção.'
}

function normalizeCorrectionResult(result) {
  if (!result) {
    return null
  }

  const normalized = { ...result }
  const nested = result.dadosIa && typeof result.dadosIa === 'object' ? result.dadosIa : null

  if (nested) {
    Object.assign(normalized, nested)
  }

  if (result.correcao && typeof result.correcao === 'object') {
    Object.assign(normalized, result.correcao)
  }

  normalized.status = normalized.status || 'CORRIGIDA'
  normalized.notaFinal = normalized.notaFinal ?? normalized.score ?? 0
  normalized.feedbackGeral = normalized.feedbackGeral || normalized.feedback || ''
  normalized.motivoHumano = normalized.motivoHumano || mapRejectReason(normalized.motivo)

  Object.keys(competencyLabels).forEach(key => {
    const value = normalized[key]
    if (typeof value === 'number') {
      normalized[key] = {
        nota: value,
        pontosPositivos: [],
        pontosNegativos: [],
        feedback: '',
      }
    }
  })

  return normalized
}

function mapCompetencies(result) {
  const normalized = normalizeCorrectionResult(result)

  return Object.entries(competencyLabels).map(([key, label]) => {
    const data = normalized?.[key] || {}
    const pointsPositive = Array.isArray(data.pontosPositivos) ? data.pontosPositivos : []
    const pointsNegative = Array.isArray(data.pontosNegativos) ? data.pontosNegativos : []

    return {
      id: label.id,
      title: label.title,
      score: Number(data?.nota ?? (typeof normalized?.[key] === 'number' ? normalized[key] : 0)),
      max: 200,
      positives: pointsPositive,
      negatives: pointsNegative,
    }
  })
}

export function ResultPage({ navigate, correctionResult, essayId }) {
  const [result, setResult] = useState(correctionResult ? normalizeCorrectionResult(correctionResult) : null)
  const [loading, setLoading] = useState(Boolean(essayId) && !correctionResult)

  useEffect(() => {
    if (!essayId) {
      if (correctionResult) {
        setResult(normalizeCorrectionResult(correctionResult))
      }
      setLoading(false)
      return
    }

    let mounted = true

    async function load() {
      try {
        const data = await buscarRedacao(essayId)
        if (!mounted) return
        const normalized = normalizeCorrectionResult(data)
        setResult(normalized)
      } catch (error) {
        if (!mounted) return
        setResult(null)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    if (correctionResult && correctionResult.redacaoId === essayId) {
      setResult(normalizeCorrectionResult(correctionResult))
      setLoading(false)
      return () => {
        mounted = false
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [essayId, correctionResult])

  if (loading) {
    return (
      <PageContainer>
        <BackButton onClick={() => navigate('/minhas-redacoes')} />
        <div className={styles.empty}>
          <h2>Carregando correção...</h2>
        </div>
      </PageContainer>
    )
  }

  if (!result) {
    return (
      <PageContainer>
        <BackButton onClick={() => navigate('/minhas-redacoes')} />
        <div className={styles.empty}>
          <h2>Nenhum resultado disponível</h2>
          <p>Crie e envie uma redação para ver o resultado aqui.</p>
        </div>
      </PageContainer>
    )
  }

  const isRejected = result.status === 'NAO_APTA'
  const competencies = mapCompetencies(result)
  const score = result.notaFinal ?? 0

  if (isRejected) {
    return (
      <PageContainer>
        <BackButton onClick={() => navigate('/minhas-redacoes')} />
        <PageHeader
          eyebrow="Correção"
          title="Redação não apta para correção"
          description={`Nota final: ${score}`}
        />
        <div className={styles.errorCard}>
          <h2>Não foi possível corrigir esta redação.</h2>
          <p>{result.motivoHumano || result.explicacao || result.feedbackGeral || 'A redação não atende aos critérios mínimos para correção.'}</p>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <BackButton onClick={() => navigate('/minhas-redacoes')} />
      <PageHeader
        eyebrow="Correção"
        title="Resultado da redação"
        description={`Nota final: ${score}/1000`}
      />
      <ScoreCard score={score} />

      <section className={styles.section}>
        <div className={styles.title}>
          <h2>Competências do ENEM</h2>
          <p>Entenda como sua redação foi avaliada em cada competência.</p>
        </div>
        <div className={styles.competencies}>
          {competencies.map(c => (
            <CompetencyCard key={c.id} competency={c} />
          ))}
        </div>
      </section>

      {result.feedbackGeral && (
        <section className={styles.feedbackGrid}>
          <div className={styles.feedback}>
            <h2>Feedback Geral</h2>
            <p className={styles.feedbackText}>{result.feedbackGeral}</p>
          </div>
        </section>
      )}
    </PageContainer>
  )
}