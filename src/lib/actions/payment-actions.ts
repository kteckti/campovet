"use server"

import { db } from "@/src/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

/**
 * Solicita confirmação de pagamento PIX
 */
export async function requestPaymentConfirmation(amount: number) {
  const session = await auth()
  if (!session?.user) throw new Error("Não autorizado")
  const user = session.user as any

  try {
    await db.paymentRequest.create({
      data: {
        tenantId: user.tenantId,
        amount: amount,
        status: "PENDING",
      }
    })
    revalidatePath("/pagamento")
    return { success: true }
  } catch (error) {
    console.error("Erro ao solicitar confirmação:", error)
    return { error: "Erro ao processar solicitação." }
  }
}

/**
 * Busca todas as solicitações pendentes (Para o Admin)
 */
export async function getPendingPaymentRequests() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "GERENTE") {
    // Em um sistema real, aqui teríamos uma role de SUPERADMIN
    // Por enquanto, vamos permitir que o GERENTE (dono da clínica) veja se for o admin do sistema
    // Ou validar pelo e-mail específico do admin
    if (session?.user?.email !== "kteckti@gmail.com") {
        throw new Error("Não autorizado")
    }
  }

  return await db.paymentRequest.findMany({
    where: { status: "PENDING" },
    include: {
      tenant: {
        include: {
          plan: true,
          users: {
            where: { role: "GERENTE" },
            take: 1
          }
        }
      }
    },
    orderBy: { requestedAt: "desc" }
  })
}

/**
 * Aprova um pagamento e renova o acesso por 1 mês
 */
export async function approvePayment(requestId: string) {
  const session = await auth()
  if (session?.user?.email !== "kteckti@gmail.com") throw new Error("Não autorizado")

  try {
    const request = await db.paymentRequest.findUnique({
      where: { id: requestId },
      include: { tenant: true }
    })

    if (!request) throw new Error("Solicitação não encontrada")

    const now = new Date()
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    await db.$transaction([
      // 1. Atualizar status da solicitação
      db.paymentRequest.update({
        where: { id: requestId },
        data: { 
          status: "APPROVED",
          processedAt: now
        }
      }),
      // 2. Atualizar status do Tenant e data de expiração
      db.tenant.update({
        where: { id: request.tenantId },
        data: {
          subscriptionStatus: "ACTIVE",
          trialEndsAt: nextMonth, // Usamos trialEndsAt como data de expiração geral
          lastPaymentAt: now,
          nextBillingAt: nextMonth
        }
      }),
      // 3. Atualizar expiração dos módulos
      db.tenantModule.updateMany({
        where: { tenantId: request.tenantId },
        data: {
          expiresAt: nextMonth,
          isActive: true
        }
      })
    ])

    revalidatePath("/admin/pagamentos")
    return { success: true }
  } catch (error) {
    console.error("Erro ao aprovar pagamento:", error)
    return { error: "Erro ao processar aprovação." }
  }
}

/**
 * Verifica o status da assinatura do tenant atual
 */
export async function getSubscriptionStatus() {
  const session = await auth()
  if (!session?.user) return null
  const user = session.user as any

  const tenant = await db.tenant.findUnique({
    where: { id: user.tenantId },
    select: {
      subscriptionStatus: true,
      trialEndsAt: true,
      plan: true
    }
  })

  if (!tenant) return null

  const now = new Date()
  const expiresAt = tenant.trialEndsAt ? new Date(tenant.trialEndsAt) : null
  
  let daysRemaining = 0
  if (expiresAt) {
    const diffTime = expiresAt.getTime() - now.getTime()
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return {
    status: tenant.subscriptionStatus,
    expiresAt,
    daysRemaining,
    planName: tenant.plan?.name,
    planPrice: tenant.plan?.price ? Number(tenant.plan.price) : 0,
    isExpiringSoon: daysRemaining <= 3 && daysRemaining >= 0,
    isExpired: daysRemaining < 0
  }
}
