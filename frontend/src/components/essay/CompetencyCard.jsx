import styles from './CompetencyCard.module.css'

export function CompetencyCard({ competency }) {
 const percentage = (competency.score / competency.max) * 100
 const positives = Array.isArray(competency.positives) ? competency.positives.filter(Boolean) : []
 const negatives = Array.isArray(competency.negatives) ? competency.negatives.filter(Boolean) : []

 return (
   <article className={styles.card}>
     <div className={styles.top}>
       <div>
         <span className={styles.code}>{competency.id}</span>
         <h3>{competency.title}</h3>
       </div>
       <strong>{competency.score}<small>/200</small></strong>
     </div>

     <div className={styles.bar}>
       <span style={{ width: `${percentage}%` }} />
     </div>

     <div className={styles.pointsGroup}>
       <div className={styles.points}>
         <b>Pontos positivos</b>
         {positives.length > 0 ? (
           <ul>
             {positives.map((item, index) => <li key={`${competency.id}-positive-${index}`}>{item}</li>)}
           </ul>
         ) : (
           <span className={styles.empty}>Nenhum ponto destacado.</span>
         )}
       </div>

       <div className={styles.points}>
         <b>Pontos negativos</b>
         {negatives.length > 0 ? (
           <ul>
             {negatives.map((item, index) => <li key={`${competency.id}-negative-${index}`}>{item}</li>)}
           </ul>
         ) : (
           <span className={styles.empty}>Nenhum ponto crítico identificado.</span>
         )}
       </div>
     </div>
   </article>
 )
}