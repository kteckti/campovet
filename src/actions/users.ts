"use server"

import { db } from "@/src/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

// Criar Funcionário
export async function createEmployee(tenantId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user || (session.user as any).tenantSlug !== tenantId) {
    throw new Error("Não autorizado")
  }
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
  const session = await auth()
  if (!session?.user || (session.user as any).tenantSlug !== tenantId) {
    throw new Error("Não autorizado")
  }

  // Em produção, verifique se o usuário não é você mesmo para não se excluir
  await db.user.delete({
    where: { 
      id: userId,
      tenant: { slug: tenantId } // Garante que só deleta se for do mesmo tenant
    }
  })
  revalidatePath(`/${tenantId}/configuracoes/equipe`)
}