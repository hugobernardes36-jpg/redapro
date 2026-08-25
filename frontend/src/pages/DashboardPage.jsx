import { useEffect, useState } from 'react'
import { Icon } from '../components/ui/Icon'
import { Button } from '../components/ui/Button'
import { PageContainer } from '../components/ui/PageContainer'
import { EssayCard } from '../components/essay/EssayCard'
import { EmailVerificationBanner } from '../components/EmailVerificationBanner'
import { CreditBalanceCard } from '../components/credits/CreditBalanceCard'
import { listarRedacoes, obterEstatisticas } from '../services/redacoes'
import { useAuth } from '../context/AuthContext'
import styles from './DashboardPage.module.css'

const TONES = ['blue', 'green', 'amber', 'purple']

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR')
}

function getLevel(avg) {
  if (avg >= 900) return 'Excelente'
  if (avg >= 700) return 'Bom desempenho'
  if (avg >= 500) return 'Em evolução'
  if (avg > 0) return 'Iniciante'
  return 'Nenhuma redação ainda'
}

export function DashboardPage({ navigate, onSelectEssay }) {
  const [stats, setStats] = useState({ averageScore: 0, essaysCount: 0, correctedCount: 0, lastScore: 0, bestScore: 0 })
  const [essays, setEssays] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const displayName = user?.name?.split(' ')[0] || (user?.email ? user.email.split('@')[0].replace(/[._-]/g, ' ').trim() : 'Usuário') || 'Usuário'

  useEffect(() => {
    async function load() {
      try {
        const [statsData, essaysData] = await Promise.all([
          obterEstatisticas(),
          listarRedacoes()
        ])
        setStats(statsData)
        setEssays(essaysData)
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const essayCards = essays.slice(0, 3).map((e, i) => ({
    id: e.id,
    title: e.tema,
    date: formatDate(e.createdAt),
    score: e.notaFinal ?? '—',
    status: e.status,
    tone: TONES[i % TONES.length],
  }))

  const level = getLevel(stats.averageScore)

  return <PageContainer wide>
    <EmailVerificationBanner />
    <section className={styles.welcome}><div><span className={styles.kicker}>INÍCIO</span><h1>Olá, {displayName}! 👋</h1><p>Continue praticando. Sua próxima redação pode ser a sua melhor.</p></div><div className={styles.level}><span>Nível atual</span><strong>{level}</strong><small>{stats.essaysCount > 0 ? `${stats.correctedCount} redações corrigidas` : 'Escreva sua primeira redação'}</small></div></section>
    <section className={styles.cta}><div className={styles.ctaIcon}><Icon name="edit" size={24}/></div><div><span>PRONTO PARA PRATICAR?</span><h2>Escreva uma nova redação</h2><p>Escolha um tema e coloque suas ideias no papel.</p></div><Button size="lg" onClick={()=>navigate('/nova-redacao')}>Nova Redação <Icon name="arrowRight" size={16}/></Button></section>
    <CreditBalanceCard navigate={navigate} />
    <section className={styles.stats}>{[['Média das notas',stats.averageScore,'chart'],['Redações feitas',stats.essaysCount,'file'],['Última nota',stats.lastScore,'check'],['Melhor nota',stats.bestScore,'spark']].map(([label,value,icon])=><article key={label}><div className={styles.statIcon}><Icon name={icon} size={17}/></div><div><strong>{value}</strong><span>{label}</span></div></article>)}</section>
    <section className={styles.recent}><div className={styles.sectionTitle}><div><h2>Redações recentes</h2><p>Veja seus últimos resultados.</p></div><button type="button" onClick={()=>navigate('/minhas-redacoes')}>Ver todas <Icon name="arrowRight" size={15}/></button></div>
      {loading ? (
        <div className={styles.loadingState}>Carregando...</div>
      ) : essayCards.length > 0 ? (
        essayCards.map(e=><EssayCard key={e.id} essay={e} onOpen={()=>{onSelectEssay(e.id);navigate(`/redacao/${e.id}`)}}/>)
      ) : (
        <div className={styles.emptyState}>Nenhuma redação ainda. Que tal escrever a primeira?</div>
      )}
    </section>
  </PageContainer>
}