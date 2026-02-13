'use server'

import { db } from "@/src/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createEquineAnimal(tenantId: string, formData: FormData) {
  const name = formData.get("name") as string
  const type = formData.get("type") as string // STALLION, DONOR, RECIPIENT
  const breed = formData.get("breed") as string
  const registerNum = formData.get("registerNum") as string

  const tenant = await db.tenant.findUnique({ where: { slug: tenantId } })
  if (!tenant) throw new Error("Empresa não encontrada")

  await db.equineAnimal.create({
    data: {
      name,
      type,
      breed,
      registerNum,
      tenantId: tenant.id
    }
  })

  revalidatePath(`/${tenantId}/equinos`)
  redirect(`/${tenantId}/equinos`)
}

export async function createSemenCollection(tenantId: string, formData: FormData) {
  const stallionId = formData.get("stallionId") as string
  const volume = parseFloat(formData.get("volume") as string || "0")
  const concentration = parseInt(formData.get("concentration") as string || "0")
  const motility = parseFloat(formData.get("motility") as string || "0")
  const observations = formData.get("observations") as string

  const tenant = await db.tenant.findUnique({ where: { slug: tenantId } })
  if (!tenant) throw new Error("Empresa não encontrada")

  await db.semenCollection.create({
    data: {
      stallionId,
      volume,
      concentration,
      motility,
      observations,
      tenantId: tenant.id
    }
  })

  revalidatePath(`/${tenantId}/equinos/coletas`)
}

export async function createReproductiveCycle(tenantId: string, formData: FormData) {
  const animalId = formData.get("animalId") as string
  
  const tenant = await db.tenant.findUnique({ where: { slug: tenantId } })
  if (!tenant) throw new Error("Empresa não encontrada")

  await db.reproductiveCycle.create({
    data: {
      animalId,
      status: "OPEN",
      tenantId: tenant.id
    }
  })

  revalidatePath(`/${tenantId}/equinos/ciclos`)
}
