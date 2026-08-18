import { useState } from 'react'
import { Icon } from '../components/ui/Icon'
import { Logo } from '../components/ui/Logo'
import { Button } from '../components/ui/Button'
import styles from './LoginPage.module.css'

export function LoginPage({ onLogin }) {
 const [email,setEmail]=useState('')
 const [password,setPassword]=useState('')
 const submit=(e)=>{
   e.preventDefault()
   onLogin({ email: email.trim(), password: password.trim() })
 }
 return <div className={styles.page}><div className={styles.visual}><div><Logo/><span className={styles.kicker}>PREPARAÇÃO PARA O ENEM</span><h1>Escreva melhor.<br/><b>Evolua mais.</b></h1><p>Pratique sua redação, entenda seu desempenho e acompanhe sua evolução em um só lugar.</p><div className={styles.quote}>“Cada redação é uma oportunidade de melhorar.”</div></div></div><main className={styles.panel}><div className={styles.formWrap}><div className={styles.mobileLogo}><Logo/></div><span className={styles.kicker}>BEM-VINDO DE VOLTA</span><h2>Entrar no RedaPro</h2><p className={styles.subtitle}>Acesse sua conta para continuar seus estudos.</p><form onSubmit={submit}><label><span>E-mail</span><div className={styles.input}><Icon name="mail" size={17}/><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com"/></div></label><label><span>Senha</span><div className={styles.input}><Icon name="lock" size={17}/><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Sua senha"/></div></label><button className={styles.forgot} type="button">Esqueci minha senha</button><Button type="submit" size="lg" className={styles.submit}>Entrar</Button></form><p className={styles.signup}>Ainda não tem uma conta? <button type="button">Criar conta</button></p><small className={styles.demo}>Demo: use qualquer e-mail e senha válidos para entrar e sua sessão será salva localmente.</small></div></main></div>
}