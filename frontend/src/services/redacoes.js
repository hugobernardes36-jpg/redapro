import { apiFetch } from './api'

function mapearMotivoHumano(motivo) {
  const mensagens = {
    'Redação em branco.': 'A redação está em branco.',
    'Texto da redação não informado.': 'A redação não foi informada corretamente.',
    'Texto muito curto para uma redação do ENEM.': 'A redação está muito curta para ser avaliada.',
    fuga_ao_tema: 'A redação fugiu do tema proposto.',
    texto_sem_sentido: 'O texto não apresenta sentido e coerência suficientes para uma correção.',
    texto_insuficiente: 'A redação não possui desenvolvimento suficiente para ser corrigida.',
    nao_dissertativo_argumentativo: 'A redação não tem estrutura dissertativo-argumentativa adequada.',
    conteudo_inadequado: 'O conteúdo da redação não atende aos critérios mínimos para correção.',
  }

  return mensagens[motivo] || 'A redação não atende aos critérios mínimos para correção.'
}

// O usuário é identificado pelo backend via cookie de sessão; nunca enviamos userId a partir do frontend.
export async function criarRedacao({ tema, texto }) {
  const response = await apiFetch('/api/redacoes', {
    method: 'POST',
    body: JSON.stringify({ tema, texto }),
  })

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.erro || 'Erro ao criar redação')
  }

  return response.json()
}

export async function corrigirRedacao(id) {
  const response = await apiFetch(`/api/redacoes/${id}/corrigir`, {
    method: 'POST',
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.erro || 'Erro ao corrigir redação')
  }

  if (payload?.status === 'NAO_APTA') {
    throw new Error(payload.motivoHumano || payload.feedbackGeral || payload.explicacao || mapearMotivoHumano(payload.motivo) || 'A redação não foi aprovada para correção.')
  }

  return payload
}

export async function listarRedacoes() {
  const response = await apiFetch('/api/redacoes')

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.erro || 'Erro ao listar redações')
  }

  return response.json()
}

export async function buscarRedacao(id) {
  const response = await apiFetch(`/api/redacoes/${id}`)

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.erro || 'Erro ao buscar redação')
  }

  return response.json()
}

export async function obterEstatisticas() {
  const response = await apiFetch('/api/redacoes/stats')

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(erro?.erro || 'Erro ao obter estatísticas')
  }

  return response.json()
}