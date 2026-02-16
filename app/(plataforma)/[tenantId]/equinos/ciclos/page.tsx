import { db } from "@/src/lib/db"
import Link from "next/link"
import { 
  Plus, 
  ArrowLeft,
  Heart,
  AlertCircle,
  Calendar
} from "lucide-react"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function CiclosPage({ params }: PageProps) {
  const { tenantId } = await params

  const cycles = await db.reproductiveCycle.findMany({
    where: { tenant: { slug: tenantId } },
    include: { 
      animal: true,
      inseminations: { take: 1, orderBy: { date: 'desc' } }
    },
    orderBy: { startDate: 'desc' }
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href={`/${tenantId}/equinos`}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft size={18} /> Voltar
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Heart className="text-pink-600" size={32} />
            Ciclos Reprodutivos
          </h1>
          <p className="text-gray-500 mt-1">Acompanhamento de cio, inseminações e gestação.</p>
        </div>
        
        <Link 
          href={`/${tenantId}/equinos/ciclos/novo`}
          className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
        >
          <Plus size={18} /> Novo Ciclo
        </Link>
      </div>

      {/* Tabela de Ciclos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-800">Ciclos em Andamento</h2>
        </div>
        
        {cycles.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Nenhum ciclo registrado</h3>
            <p className="text-gray-500 text-sm">Inicie um novo ciclo reprodutivo para uma égua.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-medium">Início</th>
                <th className="px-6 py-3 font-medium">Égua</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Última Inseminação</th>
                <th className="px-6 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cycles.map((cycle) => (
                <tr key={cycle.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {new Date(cycle.startDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cycle.animal.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      cycle.status === 'OPEN' 
                        ? 'bg-blue-100 text-blue-700' 
                        : cycle.status === 'PREGNANT'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {cycle.status === 'OPEN' ? 'Aberto' : cycle.status === 'PREGNANT' ? 'Prenha' : 'Fechado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {cycle.inseminations.length > 0 
                      ? new Date(cycle.inseminations[0].date).toLocaleDateString('pt-BR')
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:underline text-sm font-medium">
                      Gerenciar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
