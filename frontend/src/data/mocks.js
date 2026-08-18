export const mockUser = {
  name: 'Hugo',
  fullName: 'Hugo Bernardes',
  email: 'hugo@redapro.com',
  level: 'Em evolução',
}

export const mockStats = {
  averageScore: 742,
  essaysCount: 12,
  correctedCount: 9,
  lastScore: 780,
  bestScore: 820,
}

export const mockEssays = [
  {
    id: 1,
    title: 'Uso excessivo de redes sociais',
    date: '13/08/2026',
    score: 780,
    status: 'Corrigida',
    tone: 'blue',
  },
  {
    id: 2,
    title: 'Educação no Brasil',
    date: '11/08/2026',
    score: 690,
    status: 'Corrigida',
    tone: 'green',
  },
  {
    id: 3,
    title: 'Sustentabilidade ambiental',
    date: '09/08/2026',
    score: 820,
    status: 'Corrigida',
    tone: 'amber',
  },
  {
    id: 4,
    title: 'Inclusão social',
    date: '07/08/2026',
    score: 710,
    status: 'Corrigida',
    tone: 'purple',
  },
  {
    id: 5,
    title: 'Os desafios da saúde pública',
    date: '04/08/2026',
    score: 760,
    status: 'Corrigida',
    tone: 'blue',
  },
  {
    id: 6,
    title: 'O futuro do mercado de trabalho',
    date: '01/08/2026',
    score: 735,
    status: 'Corrigida',
    tone: 'green',
  },
]

export const mockThemes = [
  { id: 1, title: 'Tecnologia e sociedade', category: 'Tecnologia', description: 'Os impactos das novas tecnologias nas relações sociais.', tone: 'blue' },
  { id: 2, title: 'Desafios para a preservação ambiental', category: 'Meio ambiente', description: 'Caminhos para conciliar desenvolvimento e preservação.', tone: 'green' },
  { id: 3, title: 'Educação e desigualdade', category: 'Educação', description: 'Os desafios para democratizar o acesso a uma educação de qualidade.', tone: 'amber' },
  { id: 4, title: 'Saúde mental entre jovens', category: 'Saúde', description: 'Responsabilidade social e políticas de prevenção.', tone: 'purple' },
  { id: 5, title: 'Inclusão e cidadania', category: 'Sociedade', description: 'Barreiras para a participação plena na sociedade.', tone: 'blue' },
  { id: 6, title: 'Transformações no trabalho', category: 'Trabalho', description: 'Automação, qualificação profissional e novas relações de trabalho.', tone: 'green' },
]

export const mockResult = {
  id: 1,
  title: 'Uso excessivo de redes sociais',
  date: '13/08/2026',
  score: 780,
  competencies: [
    { id: 'C1', title: 'Domínio da modalidade escrita', score: 160, max: 200, description: 'Bom domínio da norma-padrão, com poucos desvios pontuais.', feedback: 'Sua construção sintática é consistente. Revise concordância e pontuação em períodos mais longos.' },
    { id: 'C2', title: 'Compreensão da proposta', score: 180, max: 200, description: 'Você compreendeu a proposta e desenvolveu o tema adequadamente.', feedback: 'Mantenha a relação direta entre a tese e os argumentos apresentados ao longo do texto.' },
    { id: 'C3', title: 'Seleção e organização de informações', score: 140, max: 200, description: 'Os argumentos são pertinentes, mas podem ser aprofundados.', feedback: 'Explore mais causas, consequências e exemplos concretos para fortalecer sua argumentação.' },
    { id: 'C4', title: 'Coesão', score: 160, max: 200, description: 'Boa articulação entre as ideias e uso adequado de conectivos.', feedback: 'Varie os conectivos e evite repetir estruturas em parágrafos consecutivos.' },
    { id: 'C5', title: 'Proposta de intervenção', score: 140, max: 200, description: 'A proposta é válida, mas pode detalhar melhor seus elementos.', feedback: 'Deixe mais explícitos o agente, a ação, o meio e a finalidade da intervenção.' },
  ],
  positives: [
    'Tese clara e relacionada ao tema.',
    'Boa organização dos parágrafos.',
    'Uso consistente de repertório sociocultural.',
  ],
  improvements: [
    'Aprofundar a relação de causa e consequência.',
    'Detalhar melhor a proposta de intervenção.',
    'Variar conectivos para melhorar a fluidez.',
  ],
}

export const mockDraft = {
  title: 'Uso excessivo de redes sociais',
  text: `A expansão das redes sociais transformou a maneira como as pessoas se comunicam, consomem informações e constroem suas relações. Embora essas ferramentas ofereçam benefícios importantes, seu uso excessivo pode gerar consequências para a saúde mental e para a qualidade das interações sociais.\n\nNesse contexto, a busca constante por aprovação virtual pode contribuir para sentimentos de inadequação e ansiedade. Além disso, o consumo ininterrupto de conteúdos reduz a capacidade de concentração e favorece a formação de hábitos pouco saudáveis.\n\nPortanto, é necessário promover o uso consciente das redes sociais por meio de ações educativas e de conscientização. Escolas, famílias e plataformas digitais podem colaborar para incentivar hábitos equilibrados e ampliar o acesso a informações sobre os impactos do uso excessivo.`,
}
