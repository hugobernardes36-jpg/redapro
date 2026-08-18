import styles from './PageHeader.module.css'

export function PageHeader({ eyebrow, title, description, action }) {
  return <header className={styles.header}><div>{eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</header>
}