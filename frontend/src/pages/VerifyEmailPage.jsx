import { useEffect, useState } from 'react'
import { Logo } from '../components/ui/Logo'
import { verificarEmail } from '../services/auth'
import styles from './LoginPage.module.css'

export function VerifyEmailPage({ navigate }) {
  const [status, setStatus] = useState('confirmando')
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token') || ''
    window.history.replaceState({}, '', '/verificar-email')

    verificarEmail(token)
      .then((data) => {
        setStatus('sucesso')
        setMensagem(data.message)
      })
      .catch((error) => {
        setStatus('erro')
        setMensagem(error.message)
      })
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.visual}><div><Logo /><span className={styles.kicker}>ACESSO SEGURO</span><h1>Seu e-mail.<br /><b>Conta protegida.</b></h1><p>Confirme seu endereço para liberar todos os recursos do RedaPro.</p></div></div>
      <main className={styles.panel}><div className={styles.formWrap}>
        <div className={styles.mobileLogo}><Logo /></div>
        <h2>{status === 'confirmando' ? 'Confirmando e-mail' : status === 'sucesso' ? 'E-mail confirmado' : 'Link inválido'}</h2>
        <p className={styles.subtitle}>{status === 'confirmando' ? 'Aguarde enquanto validamos seu link.' : mensagem}</p>
        {status !== 'confirmando' && <button type="button" className={styles.submit} onClick={() => navigate('/login')}>{status === 'sucesso' ? 'Ir para o login' : 'Voltar para o login'}</button>}
      </div></main>
    </div>
  )
}