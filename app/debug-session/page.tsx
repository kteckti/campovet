import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DebugSessionPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  const user = session.user as any

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Debug de Sessão</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Informações do Usuário</h2>
          <div className="space-y-2">
            <p><strong>ID:</strong> {user?.id || 'N/A'}</p>
            <p><strong>Nome:</strong> {user?.name || 'N/A'}</p>
            <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
            <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
            <p><strong>Tenant ID:</strong> {user?.tenantId || 'N/A'}</p>
            <p><strong>Tenant Slug:</strong> {user?.tenantSlug || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Plano</h2>
          {user?.plan ? (
            <div className="space-y-2">
              <p><strong>ID:</strong> {user.plan.id}</p>
              <p><strong>Nome:</strong> {user.plan.name}</p>
              <p><strong>Preço:</strong> R$ {user.plan.price}</p>
              <p><strong>Premium:</strong> {user.plan.isPremium ? 'Sim' : 'Não'}</p>
            </div>
          ) : (
            <p className="text-red-600">⚠️ Plano não encontrado na sessão</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Módulos Ativos</h2>
          {user?.modules && user.modules.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {user.modules.map((moduleId: string) => (
                <li key={moduleId} className="text-gray-700">{moduleId}</li>
              ))}
            </ul>
          ) : (
            <p className="text-red-600">⚠️ Nenhum módulo encontrado na sessão</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Sessão Completa (JSON)</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-xs">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="mt-6">
          <a 
            href={`/${user?.tenantSlug}/dashboard`}
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Voltar ao Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
