import { useMemo, useState } from 'react'
import { BackButton } from '../components/ui/BackButton'
import { PageContainer } from '../components/ui/PageContainer'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { mockThemes } from '../data/mocks'
import styles from './ThemesPage.module.css'

export function ThemesPage({ navigate }) {
 const [category,setCategory]=useState('Todos')
 const cats=['Todos','Tecnologia','Meio ambiente','Educação','Saúde','Sociedade','Trabalho']
 const themes=useMemo(()=>category==='Todos'?mockThemes:mockThemes.filter(t=>t.category===category),[category])

 return (
   <PageContainer wide>
     <BackButton onClick={()=>navigate('/inicio')} />
     <PageHeader title="Temas de redação" description="Escolha um tema para praticar e desenvolver sua argumentação." />
     <div className={styles.filters}>{cats.map(c=><button key={c} type="button" className={category===c?styles.active:''} onClick={()=>setCategory(c)}>{c}</button>)}</div>
     <div className={styles.grid}>{themes.map(theme=><article className={styles.card} key={theme.id}><div className={`${styles.icon} ${styles[theme.tone]}`}><Icon name="book" size={20}/></div><div className={styles.body}><span>{theme.category}</span><h2>{theme.title}</h2><p>{theme.description}</p><Button size="md" onClick={()=>navigate(`/nova-redacao?tema=${encodeURIComponent(theme.title)}`)}>Praticar <Icon name="arrowRight" size={14}/></Button></div></article>)}</div>
   </PageContainer>
 )
}