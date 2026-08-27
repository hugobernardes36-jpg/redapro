import { useState } from 'react'
import { Logo } from '../components/ui/Logo'
import { reenviarVerificacao } from '../services/auth'
import styles from './LoginPage.module.css'

export function ResendVerificationPage({ navigate }) {
  const [email, setEmail] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMensagem('')
    setEnviando(true)
    try {
      const data = await reenviarVerificacao(email)
      setMensagem(data.message)
    } catch (error) {
      setMensagem(error.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.visual}><div><Logo /><span className={styles.kicker}>ACESSO SEGURO</span><h1>Confirme seu e-mail.<br /><b>Falta pouco.</b></h1><p>Solicite um novo link para confirmar o endereço da sua conta.</p></div></div>
      <main className={styles.panel}><div className={styles.formWrap}>
        <div className={styles.mobileLogo}><Logo /></div>
        <h2>Reenviar confirmação</h2>
        <p className={styles.subtitle}>Informe o e-mail usado no cadastro.</p>
        {mensagem && <div className={styles.aviso}>{mensagem}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <label><span>Email</span><div className={styles.input}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="seu@email.com" /></div></label>
          <button type="submit" className={styles.submit} disabled={enviando}>{enviando ? 'Enviando...' : 'Enviar confirmação'}</button>
        </form>
        <p className={styles.signup}><button type="button" onClick={() => navigate('/login')}>Voltar para o login</button></p>
      </div></main>
    </div>
  )
}