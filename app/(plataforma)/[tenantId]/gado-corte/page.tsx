import { db } from "@/src/lib/db"
import Link from "next/link"
import { 
  Plus, 
  Beef, 
  TrendingUp,
  AlertCircle
} from "lucide-react"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function GadoCorteePage({ params }: PageProps) {
  const { tenantId } = await params

  const lots = await db.beefLot.findMany({
    where: { tenant: { slug: tenantId } },
    include: {
      animals: {
        include: {
          weighings: { take: 1, orderBy: { date: 'desc' } }
        }
      }
    }
  })

  const totalAnimals = lots.reduce((acc, lot) => acc + lot.animals.length, 0)

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Beef className="text-red-600" size={32} />
            Gado de Corte
          </h1>
          <p className="text-gray-500 mt-1">Gestão de lotes e pesagem para engorda.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href={`/${tenantId}/gado-corte/pesagens`}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <TrendingUp size={18} /> Pesagens
          </Link>
          <Link 
            href={`/${tenantId}/gado-corte/novo-lote`}
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <Plus size={18} /> Novo Lote
          </Link>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <Beef size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800">{lots.length}</span>
          </div>
          <h3 className="font-bold text-gray-800">Lotes Ativos</h3>
          <p className="text-sm text-gray-500 mt-1">Lotes em engorda.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800">{totalAnimals}</span>
          </div>
          <h3 className="font-bold text-gray-800">Total de Animais</h3>
          <p className="text-sm text-gray-500 mt-1">Cabeças em engorda.</p>
        </div>
      </div>

      {/* Tabela de Lotes */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-800">Lotes de Engorda</h2>
        </div>
        
        {lots.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Nenhum lote cadastrado</h3>
            <p className="text-gray-500 text-sm">Comece criando um novo lote de engorda.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-medium">Lote</th>
                <th className="px-6 py-3 font-medium">Descrição</th>
                <th className="px-6 py-3 font-medium">Animais</th>
                <th className="px-6 py-3 font-medium">Peso Médio</th>
                <th className="px-6 py-3 font-medium">Data Criação</th>
                <th className="px-6 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lots.map((lot) => {
                const avgWeight = lot.animals.length > 0 
                  ? lot.animals.reduce((acc, animal) => {
                      const lastWeight = animal.weighings[0]?.weight || animal.initialWeight || 0
                      return acc + lastWeight
                    }, 0) / lot.animals.length
                  : 0

                return (
                  <tr key={lot.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{lot.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lot.description || '-'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{lot.animals.length}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{avgWeight.toFixed(1)} kg</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(lot.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/${tenantId}/gado-corte/${lot.id}`}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        Ver Detalhes
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
