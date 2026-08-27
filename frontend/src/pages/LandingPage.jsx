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
    text: 'Receba nota, justificativa e feedback em cada competência para saber o que precisa evoluir.',
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
            <a href="#experiencia-correcao">Experiência de correção</a>
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

              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  document.getElementById('como-funciona')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  })
                }}
              >
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

        <section id="experiencia-correcao" className={`${styles.container} ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>experiência de correção</span>
            <h2>Veja como fica a sua avaliação.</h2>
          </div>

          <div className={styles.resultDemo} aria-label="Exemplo da correção do RedaPro">
            <div className={styles.resultSummary}>
              <div className={styles.resultTitle}>Nota final</div>
              <div className={styles.resultScoreWrap}>
                <span className={styles.resultScore}>920</span>
                <span className={styles.resultMax}>/1000</span>
              </div>
              <div className={styles.resultBadge}>
                <span className={styles.resultBadgeIcon}>✓</span>
                Bom desempenho
              </div>
            </div>

            <div className={styles.resultCompetenciasHeader}>
              <h3>Competências do ENEM</h3>
              <p>Entenda como sua redação foi avaliada em cada competência.</p>
            </div>

            <div className={styles.resultCompetencia}>
              <div className={styles.resultMeta}>
                <span className={styles.resultChip}>C1</span>
                <h4>Domínio da modalidade escrita</h4>
                <strong>160<span>/200</span></strong>
              </div>
              <div className={styles.resultBar}>
                <span style={{ width: '80%' }} />
              </div>
              <div className={styles.resultFeedbackBlock}>
                <p><strong>Pontos positivos</strong></p>
                <ul>
                  <li>Registro formal compatível com a modalidade dissertativo-argumentativa.</li>
                  <li>Parágrafos bem demarcados e vocabulário variado.</li>
                  <li>Pontuação geral adequada, favorecendo a leitura.</li>
                </ul>
                <p><strong>Pontos negativos</strong></p>
                <ul>
                  <li>Presença de incoerências gramaticais e de preposição.</li>
                  <li>Erro ortográfico: «acerca» em vez de «a cerca».</li>
                  <li>Algumas passagens têm pontuação inadequada.</li>
                </ul>
              </div>
            </div>

            <div className={styles.resultCompetencia}>
              <div className={styles.resultMeta}>
                <span className={styles.resultChip}>C2</span>
                <h4>Compreensão da proposta</h4>
                <strong>200<span>/200</span></strong>
              </div>
              <div className={styles.resultBar}>
                <span style={{ width: '100%' }} />
              </div>
              <div className={styles.resultFeedbackBlock}>
                <p><strong>Pontos positivos</strong></p>
                <ul>
                  <li>Compreensão clara da proposta: aborda perspectivas sobre o envelhecimento na sociedade brasileira.</li>
                  <li>Articulação interdisciplinar com referências históricas e sociopolíticas.</li>
                  <li>Desenvolve argumentos com exemplos e contexto adequado.</li>
                </ul>
              </div>
            </div>

            <div className={styles.resultCompetencia}>
              <div className={styles.resultMeta}>
                <span className={styles.resultChip}>C3</span>
                <h4>Seleção e organização das informações</h4>
                <strong>200<span>/200</span></strong>
              </div>
              <div className={styles.resultBar}>
                <span style={{ width: '100%' }} />
              </div>
              <div className={styles.resultFeedbackBlock}>
                <p><strong>Pontos positivos</strong></p>
                <ul>
                  <li>Estrutura argumentativa clara e bem organizada.</li>
                  <li>Uso de fontes e referências para sustentar o ponto de vista.</li>
                  <li>Conclusão articulada com o tema central.</li>
                </ul>
              </div>
            </div>

            <div className={styles.resultCompetencia}>
              <div className={styles.resultMeta}>
                <span className={styles.resultChip}>C4</span>
                <h4>Coesão e mecanismos linguísticos</h4>
                <strong>160<span>/200</span></strong>
              </div>
              <div className={styles.resultBar}>
                <span style={{ width: '80%' }} />
              </div>
              <div className={styles.resultFeedbackBlock}>
                <p><strong>Pontos positivos</strong></p>
                <ul>
                  <li>Emprego adequado de conectores e marcações discursivas.</li>
                  <li>Vocabulário preciso e repertório bom para a argumentação.</li>
                </ul>
                <p><strong>Pontos negativos</strong></p>
                <ul>
                  <li>Há alguns erros de concordância e regência.</li>
                  <li>Alguns períodos ficam mais densos do que o necessário.</li>
                </ul>
              </div>
            </div>

            <div className={styles.resultCompetencia}>
              <div className={styles.resultMeta}>
                <span className={styles.resultChip}>C5</span>
                <h4>Proposta de intervenção</h4>
                <strong>200<span>/200</span></strong>
              </div>
              <div className={styles.resultBar}>
                <span style={{ width: '100%' }} />
              </div>
              <div className={styles.resultFeedbackBlock}>
                <p><strong>Pontos positivos</strong></p>
                <ul>
                  <li>Apresenta proposta de intervenção clara e com medidas concretas.</li>
                  <li>Indicação de ações responsáveis e possíveis de serem aplicadas.</li>
                  <li>Relaciona a solução com os direitos humanos e a melhoria da qualidade de vida.</li>
                </ul>
              </div>
            </div>

            <div className={styles.resultGeneralFeedback}>
              <h4>Feedback geral</h4>
              <p>
                Redação bem estruturada, com bom desenvolvimento temático, argumentação coerente e proposta de intervenção consistente. A nota final reflete um texto sólido, com alguns pequenos ajustes de linguagem que poderiam melhorar ainda mais a fluidez e a precisão da escrita.
              </p>
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

          <div className={styles.trialBlock}>
            <p className={styles.trialTitle}>Comece grátis</p>
            <p className={styles.trialText}>2 correções grátis para começar. Depois de utilizar as duas correções gratuitas, você pode continuar pagando por correção ou adquirindo pacotes de correções.</p>
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
