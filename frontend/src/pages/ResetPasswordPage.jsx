import { useState } from 'react'
import { Icon } from '../components/ui/Icon'
import { Logo } from '../components/ui/Logo'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import styles from './LoginPage.module.css'

function useTokenFromUrl() {
  const params = new URLSearchParams(window.location.search)
  return params.get('token') || ''
}

export function ResetPasswordPage({ navigate }) {
  const token = useTokenFromUrl()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [erro, setErro] = useState(null)
  const [sucesso, setSucesso] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const { redefinirSenha } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    setErro(null)

    if (!token) {
      setErro('Link de redefinição inválido. Solicite um novo.')
      return
    }

    if (password !== confirmPassword) {
      setErro('As senhas não coincidem.')
      return
    }

    setEnviando(true)
    try {
      await redefinirSenha({ token, password })
      setSucesso(true)
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
        <h1>Escolha uma<br/><b>nova senha.</b></h1>
      </div>
    </div>
    <main className={styles.panel}>
      <div className={styles.formWrap}>
        <div className={styles.mobileLogo}><Logo/></div>
        <span className={styles.kicker}>REDEFINIR SENHA</span>
        <h2>Nova senha</h2>
        <p className={styles.subtitle}>Escolha uma senha forte para sua conta.</p>
        {erro && <div className={styles.erro} role="alert">{erro}</div>}
        {sucesso ? (
          <div className={styles.aviso} role="status">
            Senha redefinida com sucesso. <button type="button" onClick={() => navigate('/login')}>Entrar agora</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label>
              <span>Nova senha</span>
              <div className={styles.input}>
                <Icon name="lock" size={17}/>
                <input type="password" required minLength={8} maxLength={72} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" autoComplete="new-password"/>
              </div>
            </label>
            <label>
              <span>Confirmar nova senha</span>
              <div className={styles.input}>
                <Icon name="lock" size={17}/>
                <input type="password" required value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Repita a senha" autoComplete="new-password"/>
              </div>
            </label>
            <Button type="submit" size="lg" className={styles.submit} disabled={enviando}>{enviando ? 'Salvando...' : 'Redefinir senha'}</Button>
          </form>
        )}
        <p className={styles.signup}><button type="button" onClick={() => navigate('/login')}>Voltar ao login</button></p>
      </div>
    </main>
  </div>
}
