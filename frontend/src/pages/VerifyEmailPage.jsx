import { useEffect, useState } from 'react'
import { Logo } from '../components/ui/Logo'
import { useAuth } from '../context/AuthContext'
import styles from './LoginPage.module.css'

export function VerifyEmailPage({ navigate }) {
  const [estado, setEstado] = useState('verificando') // verificando | sucesso | erro
  const [mensagem, setMensagem] = useState('')
  const { verificarEmail } = useAuth()

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token')

    if (!token) {
      setEstado('erro')
      setMensagem('Link de verificação inválido.')
      return
    }

    verificarEmail(token)
      .then(() => setEstado('sucesso'))
      .catch((err) => {
        setEstado('erro')
        setMensagem(err.message)
      })
  }, [verificarEmail])

  return <div className={styles.page}>
    <main className={styles.panel} style={{ gridColumn: '1 / -1' }}>
      <div className={styles.formWrap}>
        <div className={styles.mobileLogo}><Logo/></div>
        <span className={styles.kicker}>VERIFICAÇÃO DE E-MAIL</span>
        {estado === 'verificando' && <h2>Verificando seu e-mail...</h2>}
        {estado === 'sucesso' && <>
          <h2>E-mail verificado!</h2>
          <p className={styles.subtitle}>Sua conta foi confirmada com sucesso.</p>
        </>}
        {estado === 'erro' && <>
          <h2>Não foi possível verificar</h2>
          <div className={styles.erro} role="alert">{mensagem}</div>
        </>}
        <p className={styles.signup}><button type="button" onClick={() => navigate('/inicio')}>Ir para o início</button></p>
      </div>
    </main>
  </div>
}
