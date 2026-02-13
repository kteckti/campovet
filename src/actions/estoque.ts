"use server"

import { db } from "@/src/lib/db"
import { revalidatePath } from "next/cache"

// Criar Produto
export async function createProduct(tenantId: string, formData: FormData) {
  const name = formData.get("name") as string
  const unit = formData.get("unit") as string // UN, ML, FRASCO
  const quantity = parseInt(formData.get("quantity") as string) || 0
  const minStock = parseInt(formData.get("minStock") as string) || 5
  
  // Tratamento de valores monetários (remove R$ e troca vírgula por ponto)
  const priceStr = formData.get("price") as string
  const costStr = formData.get("costPrice") as string
  
  const price = parseFloat(priceStr.replace("R$", "").replace(",", ".")) || 0
  const costPrice = parseFloat(costStr.replace("R$", "").replace(",", ".")) || 0

  const expiryDateStr = formData.get("expiryDate") as string
  const expiryDate = expiryDateStr ? new Date(expiryDateStr) : null

  if (!name) throw new Error("Nome do produto é obrigatório")

  await db.product.create({
    data: {
      name,
      unit,
      quantity,
      minStock,
      price,
      costPrice,
      expiryDate,
      tenant: { connect: { slug: tenantId } }
    }
  })

  revalidatePath(`/${tenantId}/clinica/estoque`)
}

// Atualizar Estoque (Entrada/Saída rápida ou Edição)
export async function updateStock(productId: string, tenantId: string, formData: FormData) {
  const quantity = parseInt(formData.get("quantity") as string)
  
  // Se quiser atualizar tudo, pegaria os outros campos aqui. 
  // Por enquanto vamos focar em atualizar a quantidade.
  
  await db.product.update({
    where: { id: productId },
    data: { quantity }
  })

  revalidatePath(`/${tenantId}/clinica/estoque`)
}

// Deletar Produto
export async function deleteProduct(productId: string, tenantId: string) {
  await db.product.delete({ where: { id: productId } })
  revalidatePath(`/${tenantId}/clinica/estoque`)
}