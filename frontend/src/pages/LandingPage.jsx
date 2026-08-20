import { useEffect } from 'react'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { Logo } from '../components/ui/Logo'
import styles from './LandingPage.module.css'

const highlights = [
  'Correção por redação',
  'Sem mensalidade',
  'Feedback por competência',
]

const steps = [
  {
    number: '01',
    title: 'Escreva',
    text: 'Escreva sua redação sobre um tema do ENEM e envie para a correção.',
  },
  {
    number: '02',
    title: 'Envie',
    text: 'A sua redação é avaliada pelo RedaPro com foco nas cinco competências.',
  },
  {
    number: '03',
    title: 'Melhore',
    text: 'Receba nota, justificativa e feedback para saber o que precisa evoluir.',
  },
]

const competencias = [
  'C1 — Domínio da modalidade escrita formal',
  'C2 — Compreensão da proposta e desenvolvimento do tema',
  'C3 — Seleção e organização dos argumentos',
  'C4 — Mecanismos linguísticos e coesão',
  'C5 — Proposta de intervenção',
]

export function LandingPage({ navigate }) {
  useEffect(() => {
    document.title = 'RedaPro | Corretor de redação ENEM'

    let description = document.querySelector('meta[name="description"]')
    if (!description) {
      description = document.createElement('meta')
      description.name = 'description'
      document.head.appendChild(description)
    }

    description.content = 'Corrija sua redação do ENEM com feedback pelas cinco competências, sem mensalidade. Pague pela correção ou por um pacote.'
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.container}>
          <div className={styles.brandWrap}>
            <Logo />
          </div>

          <nav className={styles.nav} aria-label="Navegação principal">
            <a href="#como-funciona">Como funciona</a>
            <a href="#competencias">Competências</a>
            <a href="#preco">Preço</a>
          </nav>

          <Button variant="secondary" size="md" onClick={() => navigate('/login')}>
            Entrar
          </Button>
        </div>
      </header>

      <main>
        <section className={`${styles.container} ${styles.hero}`}>
          <div className={styles.heroCopy}>
            <span className={styles.kicker}>
              <Icon name="spark" size={12} />
              corretor de redação ENEM
            </span>

            <h1>Treine sua redação para o ENEM sem mensalidade.</h1>

            <p className={styles.lead}>
              Envie sua redação, receba uma avaliação pelas 5 competências do ENEM e descubra
              exatamente onde pode melhorar. Sem assinatura mensal.
            </p>

            <div className={styles.actions}>
              <Button size="lg" onClick={() => navigate('/cadastro')}>
                Corrigir minha redação
              </Button>

              <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
                Como funciona
              </Button>
            </div>

            <ul className={styles.heroMeta}>
              <li>
                <Icon name="check" size={14} />
                <span>5 competências do ENEM</span>
              </li>
              <li>
                <Icon name="chart" size={14} />
                <span>Nota e feedback claros</span>
              </li>
              <li>
                <Icon name="send" size={14} />
                <span>Pague pelo que usa</span>
              </li>
            </ul>
          </div>

          <div className={styles.heroVisual} aria-label="Exemplo de correção de redação">
            <div className={styles.scoreCard}>
              <div className={styles.scoreCardHeader}>
                <span>EXEMPLO</span>
                <strong>920</strong>
              </div>

              <div className={styles.scoreBreakdown}>
                <div>
                  <span>C1</span>
                  <strong>200</strong>
                </div>
                <div>
                  <span>C2</span>
                  <strong>180</strong>
                </div>
                <div>
                  <span>C3</span>
                  <strong>180</strong>
                </div>
                <div>
                  <span>C4</span>
                  <strong>180</strong>
                </div>
                <div>
                  <span>C5</span>
                  <strong>180</strong>
                </div>
              </div>

              <div className={styles.sampleFeedback}>
                <p>Seu texto apresenta tese clara e boa organização dos argumentos.</p>
                <p>Há espaço para desenvolver melhor a proposta de intervenção.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.container}>
          <div className={styles.highlights}>
            {highlights.map((item) => (
              <div className={styles.highlightItem} key={item}>
                <Icon name="check" size={16} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.container} ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>modelo de uso</span>
            <h2>Você não precisa pagar uma mensalidade para treinar redação.</h2>
          </div>

          <div className={styles.comparisonGrid}>
            <div className={styles.comparisonCard}>
              <p className={styles.cardTag}>PLATAFORMAS POR ASSINATURA</p>
              <ul>
                <li>Mensalidade fixa</li>
                <li>Você paga mesmo sem usar</li>
                <li>Mais recursos, menos foco no essencial</li>
              </ul>
            </div>

            <div className={`${styles.comparisonCard} ${styles.featuredCard}`}>
              <p className={styles.cardTag}>REDAPRO</p>
              <ul>
                <li>Pague por correção</li>
                <li>Ou adquira um pacote</li>
                <li>Use quando precisar</li>
                <li>Foque em melhorar sua redação</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="como-funciona" className={`${styles.container} ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>como funciona</span>
            <h2>Simples. Prático. Direto ao ponto.</h2>
          </div>

          <div className={styles.stepsGrid}>
            {steps.map((step) => (
              <article key={step.number} className={styles.stepCard}>
                <span className={styles.stepNumber}>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="competencias" className={`${styles.container} ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>cinco competências</span>
            <h2>A sua redação é avaliada conforme o ENEM.</h2>
          </div>

          <div className={styles.competenciasGrid}>
            {competencias.map((item) => (
              <div key={item} className={styles.competenciaCard}>
                <span className={styles.competenciaBadge}>Competência</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.container} ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>experiência de correção</span>
            <h2>Veja como fica a sua avaliação.</h2>
          </div>

          <div className={styles.demoPanel}>
            <div className={styles.demoScore}>
              <span>Nota</span>
              <strong>920</strong>
            </div>

            <div className={styles.demoBreakdown}>
              <div><span>C1</span><strong>200</strong></div>
              <div><span>C2</span><strong>180</strong></div>
              <div><span>C3</span><strong>180</strong></div>
              <div><span>C4</span><strong>180</strong></div>
              <div><span>C5</span><strong>180</strong></div>
            </div>

            <div className={styles.demoFeedback}>
              <p>Seu texto tem boa argumentação e desenvolvimento do tema.</p>
              <p>Melhorar a proposta de intervenção pode elevar ainda mais a nota final.</p>
            </div>
          </div>
        </section>

        <section id="preco" className={`${styles.container} ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>preço</span>
            <h2>Você paga pelo que usa.</h2>
          </div>

          <div className={styles.pricingGrid}>
            <article className={styles.pricingCard}>
              <p className={styles.cardTag}>CORREÇÃO INDIVIDUAL</p>
              <h3>Uma redação</h3>
              <p>Ideal para quem quer corrigir um texto específico e receber feedback direto.</p>
            </article>

            <article className={`${styles.pricingCard} ${styles.featuredCard}`}>
              <p className={styles.cardTag}>PACOTES</p>
              <h3>Mais praticidade</h3>
              <p>Escolha um pacote de correções quando quiser treinar com mais frequência.</p>
            </article>
          </div>

          <p className={styles.pricingNote}>
            O RedaPro foi pensado para quem quer praticar sem se comprometer com uma mensalidade.
          </p>
        </section>

        <section className={`${styles.container} ${styles.finalCta}`}>
          <div>
            <span className={styles.eyebrow}>quer treinar sua redação?</span>
            <h2>Comece pela próxima correção.</h2>
          </div>

          <Button size="lg" onClick={() => navigate('/cadastro')}>
            Corrigir minha redação
          </Button>
        </section>
      </main>
    </div>
  )
}
