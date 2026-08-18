import { Sidebar } from './Sidebar'
import { MobileHeader } from './MobileHeader'
import { BottomNav } from './BottomNav'
import styles from './AppShell.module.css'

export function AppShell({ children }) {
  return (
    <div className={styles.app}>
      <MobileHeader />
      <div className={styles.layout}>
        <Sidebar />
        <main className={styles.main}>{children}</main>
      </div>
      <BottomNav />
    </div>
  )
}
