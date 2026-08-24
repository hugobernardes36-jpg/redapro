import { BackButton } from '../components/ui/BackButton'
import { PageContainer } from '../components/ui/PageContainer'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { useAuth } from '../context/AuthContext'
import { getSafeBackPath } from '../utils/navigation'
import styles from './ProfilePage.module.css'

export function ProfilePage({ navigate }) {
 const { user, logout } = useAuth()

 const handleLogout = async () => {
   await logout()
   navigate('/login')
 }

 return <PageContainer><BackButton to={getSafeBackPath(window.location.pathname)} onClick={()=>navigate(getSafeBackPath(window.location.pathname))}/><PageHeader title="Perfil" description="Suas informações pessoais e preferências."/><section className={styles.profile}><div className={styles.avatar}><Icon name="user" size={27}/></div><div><h2>{user?.name}</h2><p>{user?.email}</p></div></section><form className={styles.form} onSubmit={(e)=>e.preventDefault()}><label><span>Nome</span><input defaultValue={user?.name} readOnly/></label><label><span>E-mail</span><input defaultValue={user?.email} type="email" readOnly/></label><div className={styles.preferences}><h3>Preferências</h3><label className={styles.check}><input type="checkbox" defaultChecked/><span>Receber lembretes de estudo</span></label></div><div className={styles.actions}><Button variant="secondary" type="button" onClick={handleLogout}>Sair da conta</Button></div></form></PageContainer>
}