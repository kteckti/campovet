import { db } from "@/src/lib/db"
import { redirect } from "next/navigation"
import { Users, Shield, Trash2, Mail } from "lucide-react"
import { EmployeeModal } from "./employee-modal"
import { deleteEmployee } from "@/src/actions/users"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function TeamPage({ params }: PageProps) {
  const { tenantId } = await params

  // 1. SEGURANÇA: SOMENTE GERENTE
  const currentUserRole = "GERENTE" // Simulação. Troque pela sessão real.
  
  if (currentUserRole !== "GERENTE") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
        <Shield size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Acesso Negado</h2>
        <p>Apenas gerentes podem gerenciar a equipe.</p>
      </div>
    )
  }

  // 2. Buscar Usuários
  const users = await db.user.findMany({
    where: {
      // CORREÇÃO 1: Usar 'tenant' no singular
      tenant: { slug: tenantId } 
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="max-w-5xl mx-auto">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-blue-600" /> Gestão de Equipe
          </h1>
          <p className="text-gray-500 text-sm">Adicione veterinários e recepcionistas ao sistema.</p>
        </div>
        <EmployeeModal tenantSlug={tenantId} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Cargo (Role)</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                      {/* CORREÇÃO 2: Tratar nome nulo com fallback '?' */}
                      {(user.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name || "Sem Nome"}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail size={10} /> {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider
                    ${user.role === 'GERENTE' ? 'bg-purple-100 text-purple-700' : 
                      // CORREÇÃO 3: Removi 'VETERINARIO' pois não existe no seu Enum. Usei FUNCIONARIO.
                      user.role === 'FUNCIONARIO' ? 'bg-blue-100 text-blue-700' : 
                      user.role === 'FINANCEIRO' ? 'bg-green-100 text-green-700' : 
                      'bg-gray-100 text-gray-700'}`
                  }>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <form action={async () => {
                    "use server"
                    await deleteEmployee(user.id, tenantId)
                  }}>
                    <button 
                      type="submit" 
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                      title="Remover Acesso"
                    >
                      <Trash2 size={16} />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}