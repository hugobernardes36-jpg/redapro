import { Icon } from '../components/Icon'
import { PageContainer } from '../components/PageContainer'
import { EssayCard } from '../components/EssayCard'
import { essays } from '../data/essays'
import { navigate } from '../components/navigation'
import styles from './HomePage.module.css'

export function HomePage(){
 const stats=[['Redações feitas','12','file'],['Corrigidas','9','check'],['Média geral','742','chart']]
 return <PageContainer wide>
  <section className={styles.hero}><div><span className={styles.eyebrow}><Icon name="spark" size={12}/> VISÃO GERAL</span><h1>Olá, aluno! 👋</h1><p>Continue praticando e acompanhe a sua evolução nas redações.</p><button className={styles.primary} onClick={()=>navigate('/nova-redacao')}><Icon name="plus" size={16}/> Nova Redação</button></div><div className={styles.heroScore}><span>Média atual</span><strong>742</strong><small>de 1000 pontos</small></div></section>
  <section className={styles.stats}>{stats.map(([label,value,icon])=><article key={label}><Icon name={icon} size={20}/><div><strong>{value}</strong><span>{label}</span></div></article>)}</section>
  <section><div className={styles.sectionTitle}><div><h2>Redações recentes</h2><p>Suas últimas atividades.</p></div><button onClick={()=>navigate('/minhas-redacoes')}>Ver todas <Icon name="arrow" size={14}/></button></div>{essays.slice(0,3).map(e=><EssayCard key={e.id} essay={e}/>)}</section>
 </PageContainer>
}
