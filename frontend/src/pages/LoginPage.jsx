import { SignIn } from '@clerk/react'
import { Logo } from '../components/ui/Logo'
import styles from './LoginPage.module.css'

export function LoginPage() {
 return (
	 <div className={styles.page}>
		 <div className={styles.visual}>
			 <div>
				 <Logo />
				 <span className={styles.kicker}>PREPARAÇÃO PARA O ENEM</span>
				 <h1>Escreva melhor.<br /><b>Evolua mais.</b></h1>
				 <p>Pratique sua redação, entenda seu desempenho e acompanhe sua evolução em um só lugar.</p>
				 <div className={styles.quote}>“Cada redação é uma oportunidade de melhorar.”</div>
			 </div>
		 </div>
		 <main className={styles.panel}>
			 <div className={styles.formWrap}>
				 <div className={styles.mobileLogo}><Logo /></div>
				 <SignIn
					 routing="hash"
					 signUpUrl="/cadastro"
					 fallbackRedirectUrl="/inicio"
					 appearance={{
						 variables: {
							 colorPrimary: '#2563eb',
							 colorText: '#172033',
							 colorTextSecondary: '#94a3b8',
							 colorBackground: '#ffffff',
							 borderRadius: '7px',
							 fontFamily: 'inherit',
						 },
						 elements: {
							 rootBox: styles.clerkRoot,
							 card: styles.clerkCard,
							 headerTitle: styles.clerkHeaderTitle,
							 headerSubtitle: styles.clerkHeaderSubtitle,
							 formFieldLabel: styles.clerkLabel,
							 formFieldInput: styles.clerkInput,
							 formButtonPrimary: styles.clerkPrimary,
							 footerActionLink: styles.clerkLink,
							 identityPreviewEditButton: styles.clerkLink,
						 },
					 }}
				 />
			 </div>
		 </main>
	 </div>
 )
}

