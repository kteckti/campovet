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
  if (session?.user?.email !== "kteckti@gmail.com") {
    throw new Error("Acesso negado. Apenas o administrador central pode realizar esta ação.")
  }
  return session
}

/**
 * Lista todos os clientes (Tenants) do sistema
 */
export async function getAllTenants() {
  await checkSuperAdmin()
  const tenants = await db.tenant.findMany({
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

  // Converter Decimal para Number e Datas para Strings para evitar erro de serialização
  return tenants.map(tenant => ({
    ...tenant,
    createdAt: tenant.createdAt.toISOString(),
    updatedAt: tenant.updatedAt.toISOString(),
    trialEndsAt: tenant.trialEndsAt?.toISOString() || null,
    nextBillingAt: tenant.nextBillingAt?.toISOString() || null,
    lastPaymentAt: tenant.lastPaymentAt?.toISOString() || null,
    plan: tenant.plan ? { 
      ...tenant.plan, 
      price: Number(tenant.plan.price),
      createdAt: tenant.plan.createdAt.toISOString(),
      updatedAt: tenant.plan.updatedAt.toISOString()
    } : null
  }))
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
  const history = await db.paymentRequest.findMany({
    where: { status: "APPROVED" },
    include: {
      tenant: true
    },
    orderBy: { processedAt: "desc" }
  })

  // Converter Decimal para Number e Datas para Strings
  return history.map(item => ({
    ...item,
    amount: Number(item.amount),
    requestedAt: item.requestedAt.toISOString(),
    processedAt: item.processedAt?.toISOString() || null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    tenant: {
      ...item.tenant,
      createdAt: item.tenant.createdAt.toISOString(),
      updatedAt: item.tenant.updatedAt.toISOString(),
      trialEndsAt: item.tenant.trialEndsAt?.toISOString() || null
    }
  }))
}

/**
 * Atualiza os dados de uma empresa (Tenant)
 */
export async function updateTenant(tenantId: string, data: {
  name: string,
  slug: string,
  document: string | null,
  planId: string | null,
  subscriptionStatus: string
}) {
  await checkSuperAdmin()

  try {
    // Verificar se o novo slug já existe em outro tenant
    const existingTenant = await db.tenant.findFirst({
      where: {
        slug: data.slug,
        NOT: { id: tenantId }
      }
    })

    if (existingTenant) {
      return { error: "Este slug já está sendo usado por outra empresa." }
    }

    await db.tenant.update({
      where: { id: tenantId },
      data: {
        name: data.name,
        slug: data.slug,
        document: data.document,
        planId: data.planId,
        subscriptionStatus: data.subscriptionStatus
      }
    })

    revalidatePath("/admin/clientes")
    return { success: true }
  } catch (error) {
    console.error("Erro ao atualizar empresa:", error)
    return { error: "Erro ao atualizar os dados da empresa." }
  }
}
