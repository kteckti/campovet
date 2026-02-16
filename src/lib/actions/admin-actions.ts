"use server"

import { db } from "@/src/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

/**
 * Verifica se o usuário logado é o SuperAdmin
 */
async function checkSuperAdmin() {
  const session = await auth()
  if (session?.user?.email !== "admin@campovet.com") {
    throw new Error("Acesso negado. Apenas o administrador central pode realizar esta ação.")
  }
  return session
}

/**
 * Lista todos os clientes (Tenants) do sistema
 */
export async function getAllTenants() {
  await checkSuperAdmin()
  return await db.tenant.findMany({
    include: {
      plan: true,
      users: {
        where: { role: "GERENTE" },
        take: 1
      },
      _count: {
        select: { users: true, modules: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })
}

/**
 * Libera acesso manual (cortesia/parceria) para um tenant
 */
export async function grantManualAccess(tenantId: string, days: number, notes: string) {
  await checkSuperAdmin()

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + days)

  try {
    await db.$transaction([
      // 1. Atualizar Tenant
      db.tenant.update({
        where: { id: tenantId },
        data: {
          subscriptionStatus: "ACTIVE",
          trialEndsAt: expiresAt,
          nextBillingAt: expiresAt
        }
      }),
      // 2. Atualizar todos os módulos do tenant para a nova data
      db.tenantModule.updateMany({
        where: { tenantId },
        data: {
          expiresAt,
          isActive: true
        }
      }),
      // 3. Registrar no histórico de pagamentos como cortesia
      db.paymentRequest.create({
        data: {
          tenantId,
          amount: 0,
          status: "APPROVED",
          notes: `LIBERAÇÃO MANUAL: ${days} dias. Motivo: ${notes}`,
          processedAt: new Date()
        }
      })
    ])

    revalidatePath("/admin/clientes")
    return { success: true }
  } catch (error) {
    console.error("Erro ao liberar acesso manual:", error)
    return { error: "Erro ao processar liberação manual." }
  }
}

/**
 * Reseta a senha de um usuário administrador de uma clínica
 */
export async function resetUserPassword(userId: string, newPassword: string) {
  await checkSuperAdmin()

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })
    return { success: true }
  } catch (error) {
    console.error("Erro ao resetar senha:", error)
    return { error: "Erro ao resetar senha do usuário." }
  }
}

/**
 * Busca histórico completo de pagamentos aprovados
 */
export async function getPaymentHistory() {
  await checkSuperAdmin()
  return await db.paymentRequest.findMany({
    where: { status: "APPROVED" },
    include: {
      tenant: true
    },
    orderBy: { processedAt: "desc" }
  })
}
