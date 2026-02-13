'use server'

import { db } from "@/src/lib/db"
import { revalidatePath } from "next/cache"

// GADO LEITEIRO
export async function createDairyAnimal(tenantId: string, formData: FormData) {
  const tag = formData.get("tag") as string
  const name = formData.get("name") as string
  const breed = formData.get("breed") as string

  const tenant = await db.tenant.findUnique({ where: { slug: tenantId } })
  if (!tenant) throw new Error("Empresa não encontrada")

  await db.dairyAnimal.create({
    data: {
      tag,
      name,
      breed,
      tenantId: tenant.id
    }
  })

  revalidatePath(`/${tenantId}/gado-leite`)
}

export async function recordMilkProduction(tenantId: string, formData: FormData) {
  const animalId = formData.get("animalId") as string
  const amount = parseFloat(formData.get("amount") as string)
  const period = formData.get("period") as string // MANHA, TARDE

  const tenant = await db.tenant.findUnique({ where: { slug: tenantId } })
  if (!tenant) throw new Error("Empresa não encontrada")

  await db.milkProduction.create({
    data: {
      animalId,
      amount,
      period,
      tenantId: tenant.id
    }
  })

  revalidatePath(`/${tenantId}/gado-leite/producao`)
}

// GADO DE CORTE
export async function createBeefLot(tenantId: string, formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string

  const tenant = await db.tenant.findUnique({ where: { slug: tenantId } })
  if (!tenant) throw new Error("Empresa não encontrada")

  await db.beefLot.create({
    data: {
      name,
      description,
      tenantId: tenant.id
    }
  })

  revalidatePath(`/${tenantId}/gado-corte/lotes`)
}

export async function recordWeighing(tenantId: string, formData: FormData) {
  const animalId = formData.get("animalId") as string
  const weight = parseFloat(formData.get("weight") as string)

  const tenant = await db.tenant.findUnique({ where: { slug: tenantId } })
  if (!tenant) throw new Error("Empresa não encontrada")

  await db.weighing.create({
    data: {
      animalId,
      weight,
      tenantId: tenant.id
    }
  })

  revalidatePath(`/${tenantId}/gado-corte/pesagens`)
}
