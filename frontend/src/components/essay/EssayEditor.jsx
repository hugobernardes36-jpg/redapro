import { useMemo, useState } from 'react'
import { Icon } from '../ui/Icon'
import styles from './EssayEditor.module.css'

export function EssayEditor({ onSubmit, initialTitle = '', initialText = '' }) {
 const [title, setTitle] = useState(initialTitle)
 const [text, setText] = useState(initialText)
 const words = useMemo(() => text.trim() ? text.trim().split(/\s+/).length : 0, [text])

 return <div className={styles.wrapper}>
   <label className={styles.field}><span>Tema</span><input value={title} onChange={e=>setTitle(e.target.value)} /></label>
   <div className={styles.editorHead}><span>Redação</span><span>{words} palavras</span></div>
   <textarea className={styles.textarea} value={text} onChange={e=>setText(e.target.value)} placeholder="Comece a escrever sua redação aqui..." />
   <div className={styles.helper}><Icon name="info" size={16}/><span>Procure apresentar uma tese clara, desenvolver argumentos e finalizar com uma proposta de intervenção.</span></div>
   <button className={styles.submit} type="button" onClick={()=>onSubmit({title,text,words})}><Icon name="send" size={16}/> Corrigir redação</button>
 </div>
}