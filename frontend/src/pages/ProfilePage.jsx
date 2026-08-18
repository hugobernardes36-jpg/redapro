import { BackButton } from '../components/ui/BackButton'
import { PageContainer } from '../components/ui/PageContainer'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { mockUser } from '../data/mocks'
import styles from './ProfilePage.module.css'

export function ProfilePage({ navigate }) {
 return <PageContainer><BackButton onClick={()=>navigate('/inicio')}/><PageHeader title="Perfil" description="Suas informações pessoais e preferências."/><section className={styles.profile}><div className={styles.avatar}><Icon name="user" size={27}/></div><div><h2>{mockUser.fullName}</h2><p>{mockUser.email}</p></div></section><form className={styles.form}><label><span>Nome</span><input defaultValue={mockUser.fullName}/></label><label><span>E-mail</span><input defaultValue={mockUser.email} type="email"/></label><div className={styles.preferences}><h3>Preferências</h3><label className={styles.check}><input type="checkbox" defaultChecked/><span>Receber lembretes de estudo</span></label></div><div className={styles.actions}><Button variant="secondary" type="button" onClick={()=>navigate('/login')}>Sair da conta</Button><Button type="button">Salvar alterações</Button></div></form></PageContainer>
}