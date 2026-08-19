import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Icon } from './ui/Icon'
import styles from './EmailVerificationBanner.module.css'

export function EmailVerificationBanner() {
  const { user, reenviarVerificacao } = useAuth()
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  if (!user || user.emailVerified) {
    return null
  }

  const reenviar = async () => {
    setEnviando(true)
    try {
      await reenviarVerificacao()
      setEnviado(true)
    } catch {
      // Falha silenciosa: não é crítico, o usuário pode tentar novamente.
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className={styles.banner} role="status">
      <Icon name="mail" size={16} />
      <span>
        {enviado
          ? 'Enviamos um novo link de verificação para o seu e-mail.'
          : 'Confirme seu e-mail para garantir o acesso total à sua conta.'}
      </span>
      {!enviado && (
        <button type="button" onClick={reenviar} disabled={enviando}>
          {enviando ? 'Enviando...' : 'Reenviar e-mail'}
        </button>
      )}
    </div>
  )
}
