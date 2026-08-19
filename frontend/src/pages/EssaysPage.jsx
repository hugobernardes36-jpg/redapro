import { useEffect, useMemo, useState } from 'react'
import { BackButton } from '../components/ui/BackButton'
import { PageHeader } from '../components/ui/PageHeader'
import { PageContainer } from '../components/ui/PageContainer'
import { Icon } from '../components/ui/Icon'
import { Button } from '../components/ui/Button'
import { EssayCard } from '../components/essay/EssayCard'
import { listarRedacoes } from '../services/redacoes'
import styles from './EssaysPage.module.css'

const TONES = ['blue', 'green', 'amber', 'purple']

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR')
}

export function EssaysPage({ navigate, onSelectEssay }) {
  const [query, setQuery] = useState('')
  const [essays, setEssays] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await listarRedacoes()
        setEssays(data)
      } catch (err) {
        console.error('Erro ao carregar redações:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const essayCards = useMemo(() =>
    essays
      .filter(e => e.tema.toLowerCase().includes(query.toLowerCase()))
      .map((e, i) => ({
        id: e.id,
        title: e.tema,
        date: formatDate(e.createdAt),
        score: e.notaFinal ?? '—',
        status: e.status,
        tone: TONES[i % TONES.length],
      }))
  , [essays, query])

  return (
    <PageContainer>
      <BackButton onClick={() => navigate('/inicio')} />
      <PageHeader
        title="Minhas Redações"
        description="Consulte seus textos anteriores e acompanhe sua evolução."
        action={<Button onClick={() => navigate('/nova-redacao')}><Icon name="plus" size={16}/> Nova Redação</Button>}
      />
      <div className={styles.toolbar}>
        <label>
          <Icon name="search" size={16}/>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por tema..." />
        </label>
      </div>
      {loading ? (
        <div className={styles.empty}>Carregando...</div>
      ) : essayCards.length > 0 ? (
        <div>
          {essayCards.map(e => (
            <EssayCard
              key={e.id}
              essay={e}
              onOpen={() => { onSelectEssay(e.id); navigate(`/redacao/${e.id}`) }}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          {query ? 'Nenhuma redação encontrada.' : 'Nenhuma redação ainda. Escreva sua primeira!'}
        </div>
      )}
    </PageContainer>
  )
}