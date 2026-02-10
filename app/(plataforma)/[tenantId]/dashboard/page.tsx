import { db } from "@/src/lib/db"

interface DashboardProps {
  params: Promise<{
    tenantId: string
  }>
}

export default async function DashboardPage({ params }: DashboardProps) {
  // Em Next.js 15, params é uma Promise, por isso o await
  const { tenantId } = await params;

  const tenant = await db.tenant.findUnique({
    where: { slug: tenantId },
    include: { 
      modules: {
        include: { module: true }
      }
    }
  })

  if (!tenant) {
    return <div className="p-10 text-red-500">Empresa não encontrada: {tenantId}</div>
  }

  return (
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-bold text-gray-800">
        Olá, {tenant.name} 👋
      </h1>
      <p className="text-gray-500 mt-2">
        Painel de Gestão
      </p>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Seus Módulos Contratados:</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tenant.modules.map((tm) => (
            <div key={tm.moduleId} className="border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition bg-white">
              <h3 className="font-bold text-lg text-blue-700">
                {tm.module.name}
              </h3>
              <p className="text-sm text-gray-400 mt-1">Status: Ativo</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}