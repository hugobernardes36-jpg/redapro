import { useState } from 'react'
import { Logo } from '../components/ui/Logo'
import { useAuth } from '../context/AuthContext'
import styles from './LoginPage.module.css'

export function LoginPage({ navigate }) {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErro('')
    setEnviando(true)

    try {
      await login(form.email, form.password)
      navigate('/inicio')
    } catch (error) {
      setErro(error.message || 'Não foi possível entrar.')
    } finally {
      setEnviando(false)
    }
  }

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
          <h2>Entrar</h2>
          <p className={styles.subtitle}>Acesse sua conta para continuar.</p>
          {erro && <div className={styles.erro}>{erro}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <label>
              <span>Email</span>
              <div className={styles.input}>
                <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" placeholder="seu@email.com" />
              </div>
            </label>
            <label>
              <span>Senha</span>
              <div className={styles.input}>
                <input type="password" name="password" value={form.password} onChange={handleChange} required autoComplete="current-password" placeholder="••••••••" />
              </div>
            </label>
            <button type="submit" className={styles.submit} disabled={enviando}>{enviando ? 'Entrando...' : 'Entrar'}</button>
          </form>
          <button type="button" className={styles.forgot} onClick={() => navigate('/esqueci-senha')}>Esqueci minha senha</button>
          <button type="button" className={styles.forgot} onClick={() => navigate('/reenviar-verificacao')}>Reenviar confirmação de e-mail</button>
          <p className={styles.signup}>Ainda não tem conta? <button type="button" onClick={() => navigate('/cadastro')}>Crie uma agora</button></p>
        </div>
      </main>
    </div>
  )
}

