import { Sidebar } from './Sidebar'
import { MobileHeader } from './MobileHeader'
import { MobileNav } from './MobileNav'
import styles from './AppShell.module.css'

export function AppShell({ children, currentPath, navigate, onLogout }) {
 return <div className={styles.page}><MobileHeader navigate={navigate}/><div className={styles.layout}><Sidebar currentPath={currentPath} navigate={navigate} onLogout={onLogout}/><main className={styles.main}>{children}</main></div><MobileNav currentPath={currentPath} navigate={navigate}/></div>
}