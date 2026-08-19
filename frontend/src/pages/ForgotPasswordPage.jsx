import { useState } from 'react'
import { Icon } from '../components/ui/Icon'
import { Logo } from '../components/ui/Logo'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import styles from './LoginPage.module.css'

export function ForgotPasswordPage({ navigate }) {
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState(null)
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const { esqueciSenha } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await esqueciSenha(email.trim())
      setEnviado(true)
    } catch (err) {
      setErro(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return <div className={styles.page}>
    <div className={styles.visual}>
      <div>
        <Logo/>
        <span className={styles.kicker}>PREPARAÇÃO PARA O ENEM</span>
        <h1>Esqueceu sua senha?<br/><b>Sem problemas.</b></h1>
        <p>Enviaremos um link para você redefinir sua senha com segurança.</p>
      </div>
    </div>
    <main className={styles.panel}>
      <div className={styles.formWrap}>
        <div className={styles.mobileLogo}><Logo/></div>
        <span className={styles.kicker}>RECUPERAR ACESSO</span>
        <h2>Esqueci minha senha</h2>
        <p className={styles.subtitle}>Informe o e-mail da sua conta.</p>
        {erro && <div className={styles.erro} role="alert">{erro}</div>}
        {enviado ? (
          <div className={styles.aviso} role="status">
            Se o e-mail informado existir em nossa base, você receberá instruções para redefinir sua senha em instantes.
          </div>
        ) : (
          <form onSubmit={submit}>
            <label>
              <span>E-mail</span>
              <div className={styles.input}>
                <Icon name="mail" size={17}/>
                <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" autoComplete="email"/>
              </div>
            </label>
            <Button type="submit" size="lg" className={styles.submit} disabled={enviando}>{enviando ? 'Enviando...' : 'Enviar link de redefinição'}</Button>
          </form>
        )}
        <p className={styles.signup}>Lembrou a senha? <button type="button" onClick={() => navigate('/login')}>Voltar ao login</button></p>
      </div>
    </main>
  </div>
}
