import { useEffect, useState } from 'react'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { NewEssayPage } from './pages/NewEssayPage'
import { ResultPage } from './pages/ResultPage'
import { EssaysPage } from './pages/EssaysPage'
import { EssayDetailsPage } from './pages/EssayDetailsPage'
import { ThemesPage } from './pages/ThemesPage'
import { ProfilePage } from './pages/ProfilePage'
import { clearCurrentUser, isAuthenticated, setCurrentUser } from './services/session'

const routes = {
  '/login': LoginPage,
  '/inicio': DashboardPage,
  '/nova-redacao': NewEssayPage,
  '/resultado': ResultPage,
  '/minhas-redacoes': EssaysPage,
  '/temas': ThemesPage,
  '/perfil': ProfilePage,
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
 const [sessionTick, setSessionTick] = useState(0)

 const handleLogin = (user = {}) => {
   setCurrentUser(user)
   setSessionTick(current => current + 1)
   router.navigate('/inicio')
 }

 const handleLogout = () => {
   clearCurrentUser()
   setSessionTick(current => current + 1)
   router.navigate('/login')
 }

 const loggedIn = isAuthenticated()

 if (router.path === '/login') {
   return loggedIn ? <DashboardPage navigate={router.navigate} onSelectEssay={setSelectedEssayId} /> : <LoginPage onLogin={handleLogin} />
 }

 if (!loggedIn) {
   return <LoginPage onLogin={handleLogin} />
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
