import { db } from "@/src/lib/db"
import Link from "next/link"
import { 
  Plus, 
  Milk, 
  TrendingUp,
  AlertCircle
} from "lucide-react"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function GadoLeiteePage({ params }: PageProps) {
  const { tenantId } = await params

  const animals = await db.dairyAnimal.findMany({
    where: { tenant: { slug: tenantId } },
    include: {
      productions: { 
        take: 1, 
        orderBy: { date: 'desc' } 
      }
    }
  })

  const totalProduction = await db.milkProduction.aggregate({
    where: { tenant: { slug: tenantId } },
    _sum: { amount: true }
  })

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Milk className="text-blue-600" size={32} />
            Gado Leiteiro
          </h1>
          <p className="text-gray-500 mt-1">Gestão de produção de leite e lactação.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href={`/${tenantId}/gado-leite/producao`}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <TrendingUp size={18} /> Produção
          </Link>
          <Link 
            href={`/${tenantId}/gado-leite/novo`}
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <Plus size={18} /> Novo Animal
          </Link>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <Milk size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800">{animals.length}</span>
          </div>
          <h3 className="font-bold text-gray-800">Total de Animais</h3>
          <p className="text-sm text-gray-500 mt-1">Vacas em lactação.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800">
              {totalProduction._sum.amount ? totalProduction._sum.amount.toFixed(1) : '0'} L
            </span>
          </div>
          <h3 className="font-bold text-gray-800">Produção Total</h3>
          <p className="text-sm text-gray-500 mt-1">Litros registrados.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
              <Milk size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800">
              {animals.length > 0 ? (totalProduction._sum.amount ? (totalProduction._sum.amount / animals.length).toFixed(1) : '0') : '0'} L
            </span>
          </div>
          <h3 className="font-bold text-gray-800">Média por Animal</h3>
          <p className="text-sm text-gray-500 mt-1">Produção média.</p>
        </div>
      </div>

      {/* Tabela de Animais */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-800">Rebanho Leiteiro</h2>
        </div>
        
        {animals.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Nenhum animal cadastrado</h3>
            <p className="text-gray-500 text-sm">Comece cadastrando uma vaca leiteira.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-medium">Brinco</th>
                <th className="px-6 py-3 font-medium">Nome</th>
                <th className="px-6 py-3 font-medium">Raça</th>
                <th className="px-6 py-3 font-medium">Última Produção</th>
                <th className="px-6 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {animals.map((animal) => (
                <tr key={animal.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{animal.tag}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{animal.name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{animal.breed || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {animal.productions.length > 0 
                      ? `${animal.productions[0].amount.toFixed(1)}L - ${new Date(animal.productions[0].date).toLocaleDateString('pt-BR')}`
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/${tenantId}/gado-leite/${animal.id}`}
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      Ver Detalhes
                    </Link>
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
