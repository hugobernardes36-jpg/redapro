import { useState } from 'react'
import { Logo } from '../components/ui/Logo'
import { solicitarRedefinicaoSenha } from '../services/auth'
import styles from './LoginPage.module.css'

export function ForgotPasswordPage({ navigate }) {
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setErro('')
    setSucesso('')
    setEnviando(true)
    try {
      const data = await solicitarRedefinicaoSenha(email)
      setSucesso(data.message)
    } catch (error) {
      setErro(error.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.visual}><div><Logo /><span className={styles.kicker}>ACESSO SEGURO</span><h1>Recupere o acesso.<br /><b>Continue evoluindo.</b></h1><p>Enviaremos instruções para o e-mail informado.</p></div></div>
      <main className={styles.panel}><div className={styles.formWrap}>
        <div className={styles.mobileLogo}><Logo /></div>
        <h2>Esqueci minha senha</h2>
        <p className={styles.subtitle}>Informe seu e-mail para receber um link de redefinição.</p>
        {erro && <div className={styles.erro}>{erro}</div>}
        {sucesso && <div className={styles.aviso}>{sucesso}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <label><span>Email</span><div className={styles.input}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="seu@email.com" /></div></label>
          <button type="submit" className={styles.submit} disabled={enviando}>{enviando ? 'Enviando...' : 'Enviar instruções'}</button>
        </form>
        <p className={styles.signup}><button type="button" onClick={() => navigate('/login')}>Voltar para o login</button></p>
      </div></main>
    </div>
  )
}