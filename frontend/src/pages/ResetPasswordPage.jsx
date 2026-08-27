import { useEffect, useState } from 'react'
import { Logo } from '../components/ui/Logo'
import { redefinirSenha } from '../services/auth'
import styles from './LoginPage.module.css'

export function ResetPasswordPage({ navigate }) {
  const token = new URLSearchParams(window.location.search).get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    window.history.replaceState({}, '', '/redefinir-senha')
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setErro('')
    if (password !== confirmation) {
      setErro('As senhas não coincidem.')
      return
    }
    setEnviando(true)
    try {
      const data = await redefinirSenha(token, password)
      setSucesso(data.message)
      setTimeout(() => navigate('/login'), 1200)
    } catch (error) {
      setErro(error.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.visual}><div><Logo /><span className={styles.kicker}>ACESSO SEGURO</span><h1>Nova senha.<br /><b>Mais tranquilidade.</b></h1><p>Escolha uma senha forte para proteger sua conta.</p></div></div>
      <main className={styles.panel}><div className={styles.formWrap}>
        <div className={styles.mobileLogo}><Logo /></div>
        <h2>Redefinir senha</h2>
        <p className={styles.subtitle}>A nova senha deve ter 8 caracteres e pelo menos um número.</p>
        {erro && <div className={styles.erro}>{erro}</div>}
        {sucesso && <div className={styles.aviso}>{sucesso}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <label><span>Nova senha</span><div className={styles.input}><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" /></div></label>
          <label><span>Confirmar senha</span><div className={styles.input}><input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required autoComplete="new-password" /></div></label>
          <button type="submit" className={styles.submit} disabled={enviando || !token}>{enviando ? 'Salvando...' : 'Redefinir senha'}</button>
        </form>
        <p className={styles.signup}><button type="button" onClick={() => navigate('/login')}>Voltar para o login</button></p>
      </div></main>
    </div>
  )
}