"use server"

import { db } from "@/src/lib/db"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export async function registerTenant(formData: any) {
  const { 
    name, 
    email, 
    password, 
    clinicName, 
    planId, 
    selectedModules 
  } = formData

  // 1. Validar se o usuário já existe
  const existingUser = await db.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return { error: "Este e-mail já está cadastrado." }
  }

  // 2. Gerar slug para a clínica
  let slug = clinicName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

  // Verificar se o slug já existe e adicionar sufixo se necessário
  const existingTenant = await db.tenant.findUnique({
    where: { slug }
  })

  if (existingTenant) {
    slug = `${slug}-${Math.floor(Math.random() * 1000)}`
  }

  try {
    // 3. Criar o Tenant, Usuário e Módulos em uma transação
    const result = await db.$transaction(async (tx) => {
      // Calcular data de término do trial (3 dias)
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 3)

      // Criar o Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: clinicName,
          slug,
          planId,
          subscriptionStatus: "TRIAL",
          trialEndsAt,
        }
      })

      // Criar o Usuário Administrador
      const hashedPassword = await bcrypt.hash(password, 10)
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "GERENTE",
          tenantId: tenant.id
        }
      })

      // Ativar os módulos selecionados
      if (selectedModules && selectedModules.length > 0) {
        await tx.tenantModule.createMany({
          data: selectedModules.map((moduleId: string) => ({
            tenantId: tenant.id,
            moduleId,
            isActive: true,
            expiresAt: trialEndsAt
          }))
        })
      }

      return { tenant, user }
    })

    return { success: true, tenantSlug: result.tenant.slug }
  } catch (error) {
    console.error("Erro no registro:", error)
    return { error: "Ocorreu um erro ao processar seu cadastro. Tente novamente." }
  }
}

export async function getPlans() {
  return await db.plan.findMany({
    orderBy: { price: 'asc' }
  })
}

export async function getModules() {
  return await db.module.findMany()
}
