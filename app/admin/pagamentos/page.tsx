import { getPaymentHistory, getPendingPaymentRequests } from "@/src/lib/actions/admin-actions"
import { getPendingPaymentRequests as getPendingLegacy } from "@/src/lib/actions/payment-actions"
import { ApproveButton } from "@/app/(plataforma)/[tenantId]/admin/pagamentos/approve-button"
import { History, Clock, CheckCircle2, AlertCircle } from "lucide-react"

export default async function AdminPagamentosCentralPage() {
  const pending = await getPendingLegacy()
  const history = await getPaymentHistory()

  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financeiro & Pagamentos</h1>
        <p className="text-gray-500 mt-1">Aprove solicitações pendentes e consulte o histórico de recebimentos.</p>
      </div>

      {/* Solicitações Pendentes */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-amber-600 font-bold">
          <Clock size={20} />
          <h2>Solicitações Aguardando Aprovação ({pending.length})</h2>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Plano / Valor</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pending.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm italic">
                    Nenhuma solicitação pendente.
                  </td>
                </tr>
              ) : (
                pending.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{req.tenant.name}</div>
                      <div className="text-xs text-gray-500">{req.tenant.users[0]?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{req.tenant.plan?.name}</div>
                      <div className="text-sm font-bold text-green-600">R$ {Number(req.amount).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(req.requestedAt).toLocaleDateString('pt-BR')}
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
      </section>

      {/* Histórico de Pagamentos */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-indigo-600 font-bold">
          <History size={20} />
          <h2>Histórico de Recebimentos</h2>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Valor</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Data Aprovação</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Observações</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm italic">
                    Nenhum histórico de pagamento encontrado.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{item.tenant.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">R$ {Number(item.amount).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.processedAt ? new Date(item.processedAt).toLocaleDateString('pt-BR') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500 max-w-xs truncate" title={item.notes || ''}>
                        {item.notes || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <CheckCircle2 size={12} />
                        APROVADO
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
