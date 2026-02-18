import { getPendingPaymentRequests } from "@/src/lib/actions/payment-actions"
import { ApproveButton } from "./approve-button"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminPagamentosPage() {
  const session = await auth()
  
  // Apenas o admin central pode acessar
  if (session?.user?.email !== "admin@campovet.com") {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-xl">
        <h2 className="text-red-800 font-bold text-lg">Acesso Negado</h2>
        <p className="text-red-600 mt-2">Esta área é restrita ao administrador do sistema.</p>
      </div>
    )
  }

  const requests = await getPendingPaymentRequests()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Pagamentos</h1>
        <p className="text-gray-500">Aprove as solicitações de acesso após confirmar o PIX.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Clínica / Empresa</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Responsável</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Plano</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Data Solicitação</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Nenhuma solicitação pendente no momento.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{req.tenant.name}</div>
                      <div className="text-xs text-gray-500">Slug: {req.tenant.slug}</div>
                      <div className="text-xs text-gray-500">Doc: {req.tenant.document || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{req.tenant.users[0]?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{req.tenant.users[0]?.email}</div>
                      <div className="text-xs text-gray-500">{req.tenant.users[0]?.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {req.tenant.plan?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      R$ {Number(req.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(req.requestedAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ApproveButton requestId={req.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
