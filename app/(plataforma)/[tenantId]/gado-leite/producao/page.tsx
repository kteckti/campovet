import { db } from "@/src/lib/db"
import Link from "next/link"
import { 
  Plus, 
  ArrowLeft,
  TrendingUp,
  AlertCircle
} from "lucide-react"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function ProducaoPage({ params }: PageProps) {
  const { tenantId } = await params

  const productions = await db.milkProduction.findMany({
    where: { tenant: { slug: tenantId } },
    include: { animal: true },
    orderBy: { date: 'desc' },
    take: 50
  })

  const animals = await db.dairyAnimal.findMany({
    where: { tenant: { slug: tenantId } }
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href={`/${tenantId}/gado-leite`}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft size={18} /> Voltar
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={32} />
            Registro de Produção
          </h1>
          <p className="text-gray-500 mt-1">Acompanhe a produção diária de leite.</p>
        </div>
        
        <Link 
          href={`/${tenantId}/gado-leite/producao/nova`}
          className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
        >
          <Plus size={18} /> Registrar Produção
        </Link>
      </div>

      {/* Tabela de Produções */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-800">Histórico de Produções</h2>
        </div>
        
        {productions.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Nenhuma produção registrada</h3>
            <p className="text-gray-500 text-sm">Comece registrando a produção diária.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Animal (Brinco)</th>
                <th className="px-6 py-3 font-medium">Quantidade (L)</th>
                <th className="px-6 py-3 font-medium">Período</th>
                <th className="px-6 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productions.map((prod) => (
                <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {new Date(prod.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {prod.animal.tag} {prod.animal.name && `- ${prod.animal.name}`}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {prod.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      prod.period === 'MANHA' 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {prod.period === 'MANHA' ? 'Manhã' : 'Tarde'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:underline text-sm font-medium">
                      Editar
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
