import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { Icon } from '../components/ui/Icon'
import { Logo } from '../components/ui/Logo'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import styles from './LoginPage.module.css'

export function LoginPage({ navigate }) {
 const [email,setEmail]=useState('')
 const [password,setPassword]=useState('')
 const [erro,setErro]=useState(null)
 const [enviando,setEnviando]=useState(false)
 const { login, loginComGoogle } = useAuth()

 const submit=async(e)=>{
   e.preventDefault()
   setErro(null)
   setEnviando(true)
   try {
     await login({ email: email.trim(), password })
     navigate('/inicio')
   } catch (err) {
     setErro(err.message)
   } finally {
     setEnviando(false)
   }
 }

 const handleGoogleSuccess = async (credentialResponse) => {
   setErro(null)
   try {
     await loginComGoogle(credentialResponse.credential)
     navigate('/inicio')
   } catch (err) {
     setErro(err.message)
   }
 }

 return <div className={styles.page}><div className={styles.visual}><div><Logo/><span className={styles.kicker}>PREPARAÇÃO PARA O ENEM</span><h1>Escreva melhor.<br/><b>Evolua mais.</b></h1><p>Pratique sua redação, entenda seu desempenho e acompanhe sua evolução em um só lugar.</p><div className={styles.quote}>“Cada redação é uma oportunidade de melhorar.”</div></div></div><main className={styles.panel}><div className={styles.formWrap}><div className={styles.mobileLogo}><Logo/></div><span className={styles.kicker}>BEM-VINDO DE VOLTA</span><h2>Entrar no RedaPro</h2><p className={styles.subtitle}>Acesse sua conta para continuar seus estudos.</p>{erro && <div className={styles.erro} role="alert">{erro}</div>}<form onSubmit={submit}><label><span>E-mail</span><div className={styles.input}><Icon name="mail" size={17}/><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" autoComplete="email"/></div></label><label><span>Senha</span><div className={styles.input}><Icon name="lock" size={17}/><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Sua senha" autoComplete="current-password"/></div></label><button className={styles.forgot} type="button" onClick={() => navigate('/esqueci-senha')}>Esqueci minha senha</button><Button type="submit" size="lg" className={styles.submit} disabled={enviando}>{enviando ? 'Entrando...' : 'Entrar'}</Button></form><div className={styles.googleWrap}><GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setErro('Não foi possível entrar com o Google.')} width="100%" text="continue_with"/></div><p className={styles.signup}>Ainda não tem uma conta? <button type="button" onClick={() => navigate('/cadastro')}>Criar conta</button></p></div></main></div>
}

