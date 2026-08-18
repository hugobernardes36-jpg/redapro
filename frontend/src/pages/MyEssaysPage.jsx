import { Icon } from '../components/Icon'
import { PageContainer } from '../components/PageContainer'
import { SectionHeader } from '../components/SectionHeader'
import { EssayCard } from '../components/EssayCard'
import { Toolbar } from '../components/Toolbar'
import { Pagination } from '../components/Pagination'
import { essays } from '../data/essays'
import { navigate } from '../components/navigation'
import styles from './MyEssaysPage.module.css'

export function MyEssaysPage(){return <PageContainer><SectionHeader title="Minhas Redações" description="Acompanhe suas redações e evolução." action={<button className={styles.new} onClick={()=>navigate('/nova-redacao')}><Icon name="plus" size={16}/> Nova Redação</button>}/><Toolbar/><section>{essays.map(e=><EssayCard key={e.id} essay={e}/>)}</section><Pagination/></PageContainer>}
