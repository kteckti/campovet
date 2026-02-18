import { db } from "@/src/lib/db"
import { redirect } from "next/navigation"
import { LayoutShell } from "@/src/components/layout-shell" // <--- Importe o novo componente

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ tenantId: string }>
}

export default async function TenantLayout({ children, params }: LayoutProps) {
  // 1. Pegar o Slug da URL
  const { tenantId } = await params

  // 2. Buscar a empresa e seus módulos ativos
  const tenant = await db.tenant.findUnique({
    where: { slug: tenantId },
    include: {
      modules: {
        where: { isActive: true }, 
      }
    }
  })

  // Se a empresa não existe, manda pro 404 ou Home
  if (!tenant) {
    redirect("/")
  }

  // Extrair apenas os IDs dos módulos
  const activeModuleIds = tenant.modules.map((m) => m.moduleId)

  // 3. Renderizar o Shell do Cliente (que tem o estado da sidebar)
  return (
    <LayoutShell 
      tenantSlug={tenantId}
      activeModules={activeModuleIds}
      tenantName={tenant.name}
    >
      {children}
    </LayoutShell>
  )
}