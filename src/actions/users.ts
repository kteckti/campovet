"use server"

import { db } from "@/src/lib/db"
import { revalidatePath } from "next/cache"

// Criar Funcionário
export async function createEmployee(tenantId: string, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const role = formData.get("role") as any // "VETERINARIO", "RECEPCAO", etc

  if (!name || !email || !role) {
    throw new Error("Preencha todos os campos")
  }

  // OBS: Em um sistema real com Login (NextAuth, Clerk, etc), 
  // você criaria a conta no provedor de auth aqui também.
  // Aqui vamos criar apenas no banco de dados local.

  await db.user.create({
    data: {
      name,
      email,
      role,
      // CORREÇÃO: Usar 'tenant' no singular
      tenant: { connect: { slug: tenantId } } 
    }
  })

  revalidatePath(`/${tenantId}/configuracoes/equipe`)
}

// Remover Funcionário
export async function deleteEmployee(userId: string, tenantId: string) {
  // Em produção, verifique se o usuário não é você mesmo para não se excluir
  await db.user.delete({
    where: { id: userId }
  })
  revalidatePath(`/${tenantId}/configuracoes/equipe`)
}