import { useState } from 'react'
import { Logo } from '../components/ui/Logo'
import { useAuth } from '../context/AuthContext'
import styles from './LoginPage.module.css'

export function RegisterPage({ navigate }) {
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [enviando, setEnviando] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErro('')
    setSucesso('')

    if (!/[0-9]/.test(form.password)) {
      setErro('A senha deve conter pelo menos um número.')
      return
    }

    setEnviando(true)

    try {
      await register(form.name, form.email, form.password)
      setSucesso('Conta criada com sucesso. Você pode entrar agora.')
      setTimeout(() => navigate('/login'), 900)
    } catch (error) {
      setErro(error.message || 'Não foi possível criar a conta.')
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
          <h1>Crie sua conta.<br /><b>Comece hoje.</b></h1>
          <p>Cadastre-se para praticar redações, acompanhar o progresso e receber feedback.</p>
          <div className={styles.quote}>“O primeiro passo para melhorar é começar com consistência.”</div>
        </div>
      </div>
      <main className={styles.panel}>
        <div className={styles.formWrap}>
          <div className={styles.mobileLogo}><Logo /></div>
          <h2>Criar conta</h2>
          <p className={styles.subtitle}>Digite seus dados para começar.</p>
          {erro && <div className={styles.erro}>{erro}</div>}
          {sucesso && <div className={styles.aviso}>{sucesso}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <label>
              <span>Nome</span>
              <div className={styles.input}>
                <input type="text" name="name" value={form.name} onChange={handleChange} required autoComplete="name" placeholder="Seu nome" />
              </div>
            </label>
            <label>
              <span>Email</span>
              <div className={styles.input}>
                <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" placeholder="seu@email.com" />
              </div>
            </label>
            <label>
              <span>Senha</span>
              <div className={styles.input}>
                <input type="password" name="password" value={form.password} onChange={handleChange} required autoComplete="new-password" placeholder="Mínimo 8 caracteres e 1 número" />
              </div>
            </label>
            <button type="submit" className={styles.submit} disabled={enviando}>{enviando ? 'Criando conta...' : 'Criar conta'}</button>
          </form>
          <p className={styles.signup}>Já tem conta? <button type="button" onClick={() => navigate('/login')}>Entrar</button></p>
        </div>
      </main>
    </div>
  )
}
