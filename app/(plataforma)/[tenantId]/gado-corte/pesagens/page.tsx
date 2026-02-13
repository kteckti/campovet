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

export default async function PesagensPage({ params }: PageProps) {
  const { tenantId } = await params

  const weighings = await db.weighing.findMany({
    where: { tenant: { slug: tenantId } },
    include: { animal: { include: { lot: true } } },
    orderBy: { date: 'desc' },
    take: 50
  })

  const animals = await db.beefAnimal.findMany({
    where: { tenant: { slug: tenantId } }
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href={`/${tenantId}/gado-corte`}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft size={18} /> Voltar
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-orange-600" size={32} />
            Registro de Pesagens
          </h1>
          <p className="text-gray-500 mt-1">Acompanhe o ganho de peso dos animais.</p>
        </div>
        
        <Link 
          href={`/${tenantId}/gado-corte/pesagens/nova`}
          className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
        >
          <Plus size={18} /> Registrar Pesagem
        </Link>
      </div>

      {/* Tabela de Pesagens */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-800">Histórico de Pesagens</h2>
        </div>
        
        {weighings.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Nenhuma pesagem registrada</h3>
            <p className="text-gray-500 text-sm">Comece registrando a primeira pesagem.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Animal (Brinco)</th>
                <th className="px-6 py-3 font-medium">Lote</th>
                <th className="px-6 py-3 font-medium">Peso (kg)</th>
                <th className="px-6 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {weighings.map((weigh) => (
                <tr key={weigh.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {new Date(weigh.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {weigh.animal.tag}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {weigh.animal.lot?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {weigh.weight.toFixed(1)}
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
