import styles from './PageContainer.module.css'
export function PageContainer({ children, wide=false }) { return <div className={`${styles.container} ${wide?styles.wide:''}`}>{children}</div> }