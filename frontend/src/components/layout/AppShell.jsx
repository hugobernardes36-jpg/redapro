import { Sidebar } from './Sidebar'
import { MobileHeader } from './MobileHeader'
import { BottomNav } from '../BottomNav'
import styles from './AppShell.module.css'

export function AppShell({ children, currentPath, navigate, onLogout }) {
  return (
    <div className={styles.app}>
      <MobileHeader navigate={navigate} currentPath={currentPath} onLogout={onLogout} />
      <div className={styles.layout}>
        <Sidebar currentPath={currentPath} navigate={navigate} onLogout={onLogout} />
        <main className={styles.main}>{children}</main>
      </div>
      <BottomNav currentPath={currentPath} navigate={navigate} />
    </div>
  )
}