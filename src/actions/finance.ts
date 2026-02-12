"use server"

import { db } from "@/src/lib/db"
import { revalidatePath } from "next/cache"

export async function createTransaction(tenantId: string, formData: FormData) {
  const type = formData.get("type") as string // "INCOME" ou "EXPENSE"
  const description = formData.get("description") as string
  const amountStr = formData.get("amount") as string
  const dateStr = formData.get("date") as string
  const moduleName = formData.get("module") as string // "GERAL", "CRECHE", etc
  const method = formData.get("method") as string

  if (!description || !amountStr || !dateStr) {
    throw new Error("Preencha os campos obrigatórios")
  }

  // Converter valor para float
  const amount = parseFloat(amountStr)

  // Converter data string para Date objeto (garantindo fuso)
  const date = new Date(dateStr + "T12:00:00") 

  await db.transaction.create({
    data: {
      type,
      amount,
      description,
      date,
      module: moduleName,
      method,
      tenant: { connect: { slug: tenantId } }
    }
  })

  revalidatePath(`/${tenantId}/financeiro`)
}