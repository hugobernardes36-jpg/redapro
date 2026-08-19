import { useEffect, useState } from 'react'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { DashboardPage } from './pages/DashboardPage'
import { NewEssayPage } from './pages/NewEssayPage'
import { ResultPage } from './pages/ResultPage'
import { EssaysPage } from './pages/EssaysPage'
import { EssayDetailsPage } from './pages/EssayDetailsPage'
import { ThemesPage } from './pages/ThemesPage'
import { ProfilePage } from './pages/ProfilePage'
import { useAuth } from './context/AuthContext'

const routes = {
  '/login': LoginPage,
  '/cadastro': RegisterPage,
  '/inicio': DashboardPage,
  '/nova-redacao': NewEssayPage,
  '/resultado': ResultPage,
  '/minhas-redacoes': EssaysPage,
  '/temas': ThemesPage,
  '/perfil': ProfilePage,
}

const PUBLIC_ROUTES = new Set(['/login', '/cadastro'])
// Acessíveis independentemente do usuário estar autenticado (ex.: link clicado a partir de um e-mail).
const ALWAYS_ACCESSIBLE_ROUTES = {
  '/esqueci-senha': ForgotPasswordPage,
  '/redefinir-senha': ResetPasswordPage,
  '/verificar-email': VerifyEmailPage,
}

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
  if (!path) return '/inicio'

  const parsed = new URL(path, window.location.origin)
  const pathname = parsed.pathname || '/'
  const normalized = pathname.replace(/\/+$/, '') || '/'

  return normalized === '/' ? '/inicio' : normalized
}

function useRouter() {
  const [path, setPath] = useState(() => normalizePath(window.location.href))

  useEffect(() => {
    const handlePopState = () => setPath(normalizePath(window.location.href))
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function navigate(to) {
    const next = typeof to === 'string' ? to : String(to)
    const target = new URL(next, window.location.origin)
    const finalPath = `${target.pathname}${target.search}`

    window.history.pushState({}, '', finalPath)
    setPath(normalizePath(finalPath))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return { path, navigate }
}

export default function App() {
 const router = useRouter()
 const [selectedEssayId, setSelectedEssayId] = useState(null)
 const [correctionResult, setCorrectionResult] = useState(null)
 const { isAuthenticated, loading, logout } = useAuth()

 const handleLogout = async () => {
   await logout()
   router.navigate('/login')
 }

 if (loading) {
   return null
 }

 const AlwaysAccessiblePage = ALWAYS_ACCESSIBLE_ROUTES[router.path]
 if (AlwaysAccessiblePage) {
   return <AlwaysAccessiblePage navigate={router.navigate} />
 }

 if (!isAuthenticated) {
   if (router.path === '/cadastro') {
     return <RegisterPage navigate={router.navigate} />
   }
   return <LoginPage navigate={router.navigate} />
 }

 if (PUBLIC_ROUTES.has(router.path)) {
   return <DashboardPage navigate={router.navigate} onSelectEssay={setSelectedEssayId} />
 }

 const isEssayDetailRoute = router.path === '/redacao' || router.path.startsWith('/redacao/')
 const isResultRoute = router.path === '/resultado' || router.path.startsWith('/resultado/')
 const essayId = getEssayIdFromPath(window.location.pathname)
 const Page = isEssayDetailRoute ? EssayDetailsPage : isResultRoute ? ResultPage : routes[router.path] || DashboardPage

 const pageProps = {
   navigate: router.navigate,
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
