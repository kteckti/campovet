"use server"

import { db } from "@/src/lib/db"
import bcrypt from "bcryptjs"

// Regex para validações
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/
const CLINIC_NAME_REGEX = /^[a-zA-Z0-9 ]+$/

export async function registerTenant(formData: any) {
  const { 
    name, 
    email, 
    password, 
    phone,
    document,
    clinicName, 
    planId, 
    selectedModules 
  } = formData

  // --- 1. VALIDAÇÕES ---
  if (!name || name.trim().length < 3) return { error: "Nome inválido." }
  if (!EMAIL_REGEX.test(email)) return { error: "E-mail inválido." }
  
  const phoneClean = phone.replace(/\D/g, "")
  if (phoneClean.length < 10 || phoneClean.length > 11) return { error: "Telefone inválido." }

  const docClean = document.replace(/\D/g, "")
  if (docClean.length !== 11 && docClean.length !== 14) return { error: "CPF/CNPJ inválido." }

  if (!CLINIC_NAME_REGEX.test(clinicName) || clinicName.length > 25) {
    return { error: "Nome da clínica inválido (Máx 25 caracteres, sem especiais)." }
  }

  if (!PASSWORD_REGEX.test(password)) return { error: "A senha não atende aos requisitos." }

  // --- 2. VERIFICAÇÕES ---
  const existingUser = await db.user.findUnique({ where: { email } })
  if (existingUser) return { error: "Este e-mail já está cadastrado." }

  // --- 3. SLUG ---
  let slug = clinicName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
  const existingTenant = await db.tenant.findUnique({ where: { slug } })
  if (existingTenant) slug = `${slug}-${Math.floor(Math.random() * 1000)}`

  try {
    const result = await db.$transaction(async (tx) => {
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 3)

      const tenant = await tx.tenant.create({
        data: {
          name: clinicName,
          slug,
          document: docClean,
          planId,
          subscriptionStatus: "TRIAL",
          trialEndsAt,
        }
      })

      const hashedPassword = await bcrypt.hash(password, 10)
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone: phoneClean,
          role: "GERENTE",
          tenantId: tenant.id
        }
      })

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
      return { tenant }
    })

    return { success: true, tenantSlug: result.tenant.slug }

  } catch (error) {
    console.error("Erro no registro:", error)
    return { error: "Erro interno ao processar cadastro." }
  }
}

// === AQUI ESTÁ A CORREÇÃO PRINCIPAL ===

export async function getPlans() {
  const plans = await db.plan.findMany({
    orderBy: { price: 'asc' }
  })
  
  // Converte o preço do Plano de Decimal para Number
  return plans.map(plan => ({
    ...plan,
    price: Number(plan.price)
  }))
}

export async function getModules() {
  const modules = await db.module.findMany({
    orderBy: { name: 'asc' }
  })

  // Converte TUDO que for Decimal nos Módulos para Number também.
  // Mesmo se o módulo não tiver preço agora, isso previne o erro se você adicionar depois.
  return modules.map(mod => {
    // Cria um objeto seguro copiando as propriedades
    const safeModule: any = { ...mod }
    
    // Se existir 'price' ou 'cost', converte para number
    if (safeModule.price) safeModule.price = Number(safeModule.price)
    
    return safeModule
  })
}