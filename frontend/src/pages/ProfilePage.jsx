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

 return (
   <PageContainer>
     <BackButton 
       to={getSafeBackPath(window.location.pathname)} 
       onClick={() => navigate(getSafeBackPath(window.location.pathname))}
     />
     <PageHeader title="Perfil" description="Suas informações pessoais." />
     
     <section className={styles.profile}>
       <div className={styles.avatar}>
         <Icon name="user" size={32} />
       </div>
       <div className={styles.userInfo}>
         <h2>{user?.name}</h2>
         <p>{user?.email}</p>
       </div>
     </section>
     
     <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
       <div className={styles.formGroup}>
         <label htmlFor="profile-name">Nome</label>
         <input id="profile-name" defaultValue={user?.name} readOnly />
       </div>
       
       <div className={styles.formGroup}>
         <label htmlFor="profile-email">E-mail</label>
         <input id="profile-email" defaultValue={user?.email} type="email" readOnly />
       </div>
       
       <div className={styles.actions}>
         <Button variant="danger" type="button" onClick={handleLogout}>
           Sair da conta
         </Button>
       </div>
     </form>
   </PageContainer>
 )
}