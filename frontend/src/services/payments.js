import { apiFetch } from './api'

export async function iniciarCheckout(packageId) {
  const response = await apiFetch('/api/payments/checkout', {
    method: 'POST',
    body: JSON.stringify({ packageId }),
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new Error(payload?.erro || 'Não foi possível iniciar o checkout')
  window.location.assign(payload.checkoutUrl)
}
