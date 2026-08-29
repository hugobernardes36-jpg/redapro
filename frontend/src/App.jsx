import { useEffect, useState } from 'react'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { NewEssayPage } from './pages/NewEssayPage'
import { ResultPage } from './pages/ResultPage'
import { EssaysPage } from './pages/EssaysPage'
import { EssayDetailsPage } from './pages/EssayDetailsPage'
import { ThemesPage } from './pages/ThemesPage'
import { ProfilePage } from './pages/ProfilePage'
import { CreditsPage } from './pages/CreditsPage'
import { LandingPage } from './pages/LandingPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { ResendVerificationPage } from './pages/ResendVerificationPage'
import { useAuth } from './context/AuthContext'
import { getSafeBackPath } from './utils/navigation'

const routes = {
  '/login': LoginPage,
  '/cadastro': RegisterPage,
  '/esqueci-senha': ForgotPasswordPage,
  '/redefinir-senha': ResetPasswordPage,
  '/verificar-email': VerifyEmailPage,
  '/reenviar-verificacao': ResendVerificationPage,
  '/inicio': DashboardPage,
  '/nova-redacao': NewEssayPage,
  '/resultado': ResultPage,
  '/minhas-redacoes': EssaysPage,
  '/temas': ThemesPage,
  '/perfil': ProfilePage,
  '/creditos': CreditsPage,
}

const PUBLIC_ROUTES = new Set(['/login', '/cadastro', '/esqueci-senha', '/redefinir-senha', '/verificar-email', '/reenviar-verificacao', '/'])
function getEssayIdFromPath(pathname) {
  const match = pathname.match(/^\/(?:redacao|resultado)\/(\d+)$/)
  if (match) {
    return Number(match[1])
  }

  const params = new URLSearchParams(window.location.search)
  const fallback = params.get('id')
  return fallback ? Number(fallback) : null
}

function normalizePath(path) {
  if (!path) return '/'

  const parsed = new URL(path, window.location.origin)
  const pathname = parsed.pathname || '/'
  const normalized = pathname.replace(/\/+$/, '') || '/'

  return normalized
}

function useRouter() {
  const [path, setPath] = useState(() => normalizePath(window.location.href))

  useEffect(() => {
    const handlePopState = () => setPath(normalizePath(window.location.href))
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function updateHistory(to, replace = false) {
    const next = typeof to === 'string' ? to : String(to)
    const target = new URL(next, window.location.origin)
    const finalPath = `${target.pathname}${target.search}`

    const method = replace ? 'replaceState' : 'pushState'
    window.history[method]({}, '', finalPath)
    setPath(normalizePath(finalPath))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return {
    path,
    navigate: (to) => updateHistory(to),
    replace: (to) => updateHistory(to, true),
  }
}

function getFallbackPathForCurrentRoute(pathname) {
  return getSafeBackPath(pathname)
}

export default function App() {
 const router = useRouter()
 const [selectedEssayId, setSelectedEssayId] = useState(null)
 const [correctionResult, setCorrectionResult] = useState(null)
 const { isAuthenticated, loading, logout } = useAuth()

 useEffect(() => {
  if (!loading && isAuthenticated && PUBLIC_ROUTES.has(router.path) && !['/redefinir-senha', '/verificar-email'].includes(router.path)) {
     router.replace('/inicio')
   }
 }, [isAuthenticated, loading, router])

 useEffect(() => {
   const payment = new URLSearchParams(window.location.search).get('payment')
   if (!loading && isAuthenticated && router.path === '/inicio' && payment === 'success') {
     router.replace('/nova-redacao?payment=success')
   }
 }, [isAuthenticated, loading, router])

 const handleLogout = async () => {
   await logout()
   router.navigate('/login')
 }

 if (loading) {
   return null
 }

 if (!isAuthenticated) {
   if (router.path === '/') {
     return <LandingPage navigate={router.navigate} />
   }
   if (router.path === '/cadastro') {
     return <RegisterPage navigate={router.navigate} />
   }
   if (router.path === '/login') {
     return <LoginPage navigate={router.navigate} />
   }
   if (router.path === '/esqueci-senha') {
     return <ForgotPasswordPage navigate={router.navigate} />
   }
   if (router.path === '/redefinir-senha') {
     return <ResetPasswordPage navigate={router.navigate} />
   }
   if (router.path === '/verificar-email') {
     return <VerifyEmailPage navigate={router.navigate} />
   }
   if (router.path === '/reenviar-verificacao') {
     return <ResendVerificationPage navigate={router.navigate} />
   }
   return <LandingPage navigate={router.navigate} />
 }

 // Sempre exibidas "cruas" (sem o shell/sidebar do app), mesmo com uma sessão antiga ainda ativa,
 // para não parecer que o usuário "caiu no dashboard" ao clicar no link do e-mail.
 if (router.path === '/verificar-email') {
   return <VerifyEmailPage navigate={router.navigate} />
 }
 if (router.path === '/redefinir-senha') {
   return <ResetPasswordPage navigate={router.navigate} />
 }

 if (PUBLIC_ROUTES.has(router.path)) {
   return (
     <AppShell currentPath="/inicio" navigate={router.navigate} onLogout={handleLogout}>
       <DashboardPage navigate={router.navigate} onSelectEssay={setSelectedEssayId} />
     </AppShell>
   )
 }

 const isEssayDetailRoute = router.path === '/redacao' || router.path.startsWith('/redacao/')
 const isResultRoute = router.path === '/resultado' || router.path.startsWith('/resultado/')
 const essayId = getEssayIdFromPath(window.location.pathname)
 const Page = isEssayDetailRoute ? EssayDetailsPage : isResultRoute ? ResultPage : routes[router.path] || DashboardPage

 const pageProps = {
   navigate: router.navigate,
  getBackPath: () => getFallbackPathForCurrentRoute(window.location.pathname),
   selectedEssayId: selectedEssayId ?? essayId,
   onSelectEssay: setSelectedEssayId,
   correctionResult,
   setCorrectionResult,
   essayId,
 }

 return (
   <AppShell currentPath={router.path} navigate={router.navigate} onLogout={handleLogout}>
     <Page {...pageProps} />
   </AppShell>
 )
}
