/**
 * Utilitários para Gestão de Assinaturas e Gateway de Pagamento
 * Integração sugerida: Stripe ou ASAAS (Brasil)
 */

import { db } from "./db"

export const SUBSCRIPTION_STATUS = {
  TRIAL: "TRIAL",
  ACTIVE: "ACTIVE",
  PAST_DUE: "PAST_DUE",
  CANCELED: "CANCELED",
  INACTIVE: "INACTIVE"
}

/**
 * Verifica inadimplência e aplica bloqueio após 5 dias de atraso
 */
export async function checkTenantSubscription(tenantId: string) {
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    select: {
      subscriptionStatus: true,
      nextBillingAt: true,
    }
  })

  if (!tenant) return false

  // Se já estiver cancelado ou inativo
  if (tenant.subscriptionStatus === SUBSCRIPTION_STATUS.CANCELED) return false

  // Lógica de 5 dias de atraso
  if (tenant.nextBillingAt) {
    const now = new Date()
    const fiveDaysAfterBilling = new Date(tenant.nextBillingAt)
    fiveDaysAfterBilling.setDate(fiveDaysAfterBilling.getDate() + 5)

    if (now > fiveDaysAfterBilling && tenant.subscriptionStatus !== SUBSCRIPTION_STATUS.ACTIVE) {
      // Marcar como bloqueado por atraso
      await db.tenant.update({
        where: { id: tenantId },
        data: { subscriptionStatus: SUBSCRIPTION_STATUS.PAST_DUE }
      })
      return false
    }
  }

  return true
}

/**
 * Webhook Handler para Gateway (Exemplo)
 */
export async function handlePaymentWebhook(event: any) {
  // 1. Validar assinatura do webhook
  // 2. Identificar o tipo de evento (payment_success, payment_failed)
  // 3. Atualizar o banco de dados
  
  // Se pagamento falhou:
  // await db.tenant.update({ where: { subscriptionId: event.subId }, data: { subscriptionStatus: "PAST_DUE" } })
  
  // Se pagamento sucesso:
  // await db.tenant.update({ where: { subscriptionId: event.subId }, data: { subscriptionStatus: "ACTIVE", nextBillingAt: ... } })
}
