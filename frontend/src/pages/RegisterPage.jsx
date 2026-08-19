import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { Icon } from '../components/ui/Icon'
import { Logo } from '../components/ui/Logo'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import styles from './LoginPage.module.css'

export function RegisterPage({ navigate }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [erro, setErro] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const { registrar, loginComGoogle } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    setErro(null)

    if (password !== confirmPassword) {
      setErro('As senhas não coincidem.')
      return
    }

    setEnviando(true)
    try {
      await registrar({ name: name.trim(), email: email.trim(), password })
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

  return <div className={styles.page}>
    <div className={styles.visual}>
      <div>
        <Logo/>
        <span className={styles.kicker}>PREPARAÇÃO PARA O ENEM</span>
        <h1>Escreva melhor.<br/><b>Evolua mais.</b></h1>
        <p>Crie sua conta e comece a acompanhar sua evolução na redação do ENEM.</p>
      </div>
    </div>
    <main className={styles.panel}>
      <div className={styles.formWrap}>
        <div className={styles.mobileLogo}><Logo/></div>
        <span className={styles.kicker}>COMECE AGORA</span>
        <h2>Criar conta no RedaPro</h2>
        <p className={styles.subtitle}>Leva menos de um minuto.</p>
        {erro && <div className={styles.erro} role="alert">{erro}</div>}
        <form onSubmit={submit}>
          <label>
            <span>Nome</span>
            <div className={styles.input}>
              <Icon name="user" size={17}/>
              <input type="text" required minLength={2} maxLength={120} value={name} onChange={e=>setName(e.target.value)} placeholder="Seu nome" autoComplete="name"/>
            </div>
          </label>
          <label>
            <span>E-mail</span>
            <div className={styles.input}>
              <Icon name="mail" size={17}/>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" autoComplete="email"/>
            </div>
          </label>
          <label>
            <span>Senha</span>
            <div className={styles.input}>
              <Icon name="lock" size={17}/>
              <input type="password" required minLength={8} maxLength={72} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" autoComplete="new-password"/>
            </div>
          </label>
          <label>
            <span>Confirmar senha</span>
            <div className={styles.input}>
              <Icon name="lock" size={17}/>
              <input type="password" required value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Repita a senha" autoComplete="new-password"/>
            </div>
          </label>
          <Button type="submit" size="lg" className={styles.submit} disabled={enviando}>{enviando ? 'Criando conta...' : 'Criar conta'}</Button>
        </form>
        <div className={styles.googleWrap}>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setErro('Não foi possível continuar com o Google.')} width="100%" text="signup_with" />
        </div>
        <p className={styles.signup}>Já tem uma conta? <button type="button" onClick={() => navigate('/login')}>Entrar</button></p>
      </div>
    </main>
  </div>
}
