import { db } from "@/src/lib/db"
import { redirect } from "next/navigation"
import { DollarSign, TrendingUp, Building2, Stethoscope } from "lucide-react"
import { FinanceFilters } from "./finance-filters"
import { NewTransactionModal } from "./new-transaction-modal" // <--- Importe aqui

interface PageProps {
  params: Promise<{ tenantId: string }>
  searchParams: Promise<{ start?: string, end?: string }>
}

export default async function FinanceiroPage({ params, searchParams }: PageProps) {
  const { tenantId } = await params
  const { start, end } = await searchParams

  // ==========================================
  // 1. VERIFICAÇÃO DE ROLE (Acesso Restrito)
  // Substitua isso pela sua lógica real de autenticação (ex: NextAuth, getSession)
  // ==========================================
  const userRole = "GERENTE" // Simulação. Pegue isso do seu banco/sessão.
  if (userRole !== "GERENTE" && userRole !== "FINANCEIRO") {
    // Redireciona se não tiver permissão
    redirect(`/${tenantId}/creche/baias?error=unauthorized`)
  }

  // ==========================================
  // 2. LÓGICA DE DATAS (Padrão: Mês Atual)
  // ==========================================
  const now = new Date()
  
  // Se não vier start, pega o primeiro dia do mês atual
  const startDate = start 
    ? new Date(`${start}T00:00:00`) 
    : new Date(now.getFullYear(), now.getMonth(), 1)
  
  // Se não vier end, pega o último dia do mês atual
  const endDate = end 
    ? new Date(`${end}T23:59:59`) 
    : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  // ==========================================
  // 3. BUSCAR DADOS
  // ==========================================
  const transactions = await db.transaction.findMany({
    where: {
      tenant: { slug: tenantId },
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { date: 'desc' }
  })

  // ==========================================
  // 4. CÁLCULOS DOS CARDS
  // ==========================================
  const receitas = transactions.filter(t => t.type === "INCOME")
  const despesas = transactions.filter(t => t.type === "EXPENSE")

  const totalReceita = receitas.reduce((acc, item) => acc + Number(item.amount), 0)
  const totalDespesa = despesas.reduce((acc, item) => acc + Number(item.amount), 0)
  const saldoFinal = totalReceita - totalDespesa

  // Receitas por Módulo
  const receitaCreche = receitas.filter(t => t.module === "CRECHE").reduce((acc, item) => acc + Number(item.amount), 0)
  const receitaClinica = receitas.filter(t => t.module === "CLINICA").reduce((acc, item) => acc + Number(item.amount), 0)

  // Formatação de Moeda
  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <>
      {/* CSS DE IMPRESSÃO - Ajuste de página e remoção do menu */}
      <style>{`
        @media print {
          @page { margin: 1cm; size: landscape; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          ::-webkit-scrollbar { display: none !important; }
        }
      `}</style>

      <div className="max-w-6xl mx-auto space-y-6 print:m-0 print:w-full print:max-w-none">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-end print:pb-4 print:border-b print:border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <DollarSign className="text-blue-600" size={32} />
              Painel Financeiro
            </h1>
            <p className="text-gray-500 mt-1">
              Visão consolidada do período: <span className="font-semibold">{startDate.toLocaleDateString('pt-BR')} a {endDate.toLocaleDateString('pt-BR')}</span>
            </p>
          </div>

          {/* BOTÃO NOVO AQUI NO CANTO DIREITO DO CABEÇALHO */}
          <div className="print:hidden">
            <NewTransactionModal tenantSlug={tenantId} />
          </div>
        </div>

        {/* Filtros */}
        <FinanceFilters tenantSlug={tenantId} />

        {/* CARDS RESUMO */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <p className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2 mb-2">
              <TrendingUp size={16} /> Saldo Líquido
            </p>
            <p className={`text-3xl font-bold ${saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {BRL.format(saldoFinal)}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
            <p className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2 mb-2">
              Entradas (Bruto)
            </p>
            <p className="text-2xl font-bold text-gray-800">{BRL.format(totalReceita)}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm bg-orange-50/50">
            <p className="text-sm font-semibold text-orange-600 uppercase flex items-center gap-2 mb-2">
              <Building2 size={16} /> Receita Creche
            </p>
            <p className="text-2xl font-bold text-gray-800">{BRL.format(receitaCreche)}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm bg-indigo-50/50">
            <p className="text-sm font-semibold text-indigo-600 uppercase flex items-center gap-2 mb-2">
              <Stethoscope size={16} /> Receita Clínica
            </p>
            <p className="text-2xl font-bold text-gray-800">{BRL.format(receitaClinica)}</p>
          </div>
        </div>

        {/* TABELA DETALHADA */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mt-8">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-700">Relatório Detalhado de Transações</h2>
          </div>
          
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Descrição</th>
                <th className="px-6 py-3">Módulo</th>
                <th className="px-6 py-3">Pagamento</th>
                <th className="px-6 py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    Nenhuma movimentação encontrada neste período.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(t.date).toLocaleDateString('pt-BR')} <br/>
                      <span className="text-xs">{new Date(t.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-800 max-w-xs truncate" title={t.description}>
                      {t.description}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                        ${t.module === 'CRECHE' ? 'bg-orange-100 text-orange-700' : 
                          t.module === 'CLINICA' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {t.module}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-xs font-semibold">{t.method}</td>
                    <td className={`px-6 py-3 text-right font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'INCOME' ? '+' : '-'} {BRL.format(Number(t.amount))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </>
  )
}