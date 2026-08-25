import { apiFetch } from './api'

export async function obterSaldoCreditos() {
  const response = await apiFetch('/api/credits')
  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new Error(payload?.erro || 'Erro ao consultar créditos')
  return payload
}

export async function listarPacotesCreditos() {
  const response = await apiFetch('/api/credits/packages')
  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new Error(payload?.erro || 'Erro ao listar pacotes')
  return payload
}
