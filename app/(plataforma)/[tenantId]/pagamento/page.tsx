import { getSubscriptionStatus } from "@/src/lib/actions/payment-actions"
import { PixPaymentClient } from "./pix-payment-client"
import { QrCode, ShieldCheck, Clock, Calendar } from "lucide-react"

export default async function PagamentoPage() {
  const status = await getSubscriptionStatus()

  if (!status) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assinatura e Pagamento</h1>
        <p className="text-gray-500">Gerencie seu plano e realize pagamentos via PIX.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card de Status */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <ShieldCheck size={16} />
              Status Atual
            </div>
            <div className={`text-lg font-bold ${
              status.status === 'ACTIVE' ? 'text-green-600' : 'text-amber-600'
            }`}>
              {status.status === 'TRIAL' ? 'Período de Teste' : 
               status.status === 'ACTIVE' ? 'Assinatura Ativa' : 'Aguardando Pagamento'}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50">
            <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Plano</div>
            <div className="font-bold text-gray-900">{status.planName}</div>
          </div>
        </div>

        {/* Card de Vencimento */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <Calendar size={16} />
              Vencimento
            </div>
            <div className="text-lg font-bold text-gray-900">
              {status.expiresAt ? status.expiresAt.toLocaleDateString('pt-BR') : 'N/A'}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50">
            <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Dias Restantes</div>
            <div className={`font-bold ${status.daysRemaining <= 3 ? 'text-red-600' : 'text-gray-900'}`}>
              {status.daysRemaining} dias
            </div>
          </div>
        </div>

        {/* Card de Valor */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <Clock size={16} />
              Próxima Cobrança
            </div>
            <div className="text-lg font-bold text-gray-900">
              R$ {status.planPrice.toFixed(2)}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50">
            <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Frequência</div>
            <div className="font-bold text-gray-900">Mensal</div>
          </div>
        </div>
      </div>

      {/* Área de Pagamento PIX */}
      <div className="bg-indigo-600 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold mb-6">
              <QrCode size={14} />
              PAGAMENTO INSTANTÂNEO
            </div>
            <h2 className="text-3xl font-bold mb-4">Renove sua assinatura via PIX</h2>
            <p className="text-indigo-100 mb-8">
              Realize o pagamento do valor do seu plano para garantir a continuidade do serviço. 
              Após o pagamento, clique no botão de confirmação para que nossa equipe libere seu acesso.
            </p>
            
            <PixPaymentClient amount={status.planPrice} />
          </div>

          <div className="bg-white rounded-2xl p-8 text-gray-900 shadow-2xl">
            <div className="text-center space-y-4">
              <div className="w-48 h-48 bg-gray-100 mx-auto rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
                <QrCode size={120} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-500">Escaneie o QR Code no seu app de banco ou use a chave abaixo.</p>
              
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Chave PIX (Copia e Cola)</p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono text-xs break-all">
                  7bd12887-e9fa-4edd-9f52-da5f41d68724
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Elementos Decorativos */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/30 rounded-full -ml-32 -mb-32 blur-3xl" />
      </div>
    </div>
  )
}
