import { Sidebar } from "@/src/components/sidebar"
import { db } from "@/src/lib/db"
import { redirect } from "next/navigation"

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
        where: { isActive: true }, // Só queremos os ativos
      }
    }
  })

  // Se a empresa não existe, manda pro 404 ou Home
  if (!tenant) {
    redirect("/")
  }

  // Extrair apenas os IDs dos módulos (ex: ['mod_creche', 'mod_clinica'])
  const activeModuleIds = tenant.modules.map((m) => m.moduleId)

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {/* Sidebar Fixa à Esquerda */}
      <Sidebar 
        tenantSlug={tenantId} 
        activeModules={activeModuleIds} 
      />

      {/* Área Principal de Conteúdo */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 shadow-sm">
           <h1 className="font-semibold text-lg text-gray-700">
             {tenant.name}
           </h1>
        </header>
        
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}