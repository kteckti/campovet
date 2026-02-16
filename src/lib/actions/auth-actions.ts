"use server"

import { auth } from "@/auth"

/**
 * Busca o slug do tenant do usuário logado na sessão atual.
 * Utilizado para redirecionar o usuário para a URL correta da sua clínica.
 */
export async function getMyTenantSlug() {
  const session = await auth()
  const user = session?.user as any
  return user?.tenantSlug || null
}
