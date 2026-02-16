import { db } from "@/src/lib/db"
import Link from "next/link"
import { 
  Plus, 
  History, 
  Droplets, 
  Heart,
  ClipboardList,
  AlertCircle
} from "lucide-react"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function EquinosPage({ params }: PageProps) {
  const { tenantId } = await params

  const animals = await db.equineAnimal.findMany({
    where: { tenant: { slug: tenantId } },
    include: {
      semenCollections: { take: 1, orderBy: { date: 'desc' } },
      cycles: { take: 1, orderBy: { startDate: 'desc' } }
    }
  })

  const stallions = animals.filter(a => a.type === 'STALLION')
  const mares = animals.filter(a => a.type === 'DONOR' || a.type === 'RECIPIENT')

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <ClipboardList className="text-amber-600" size={32} />
            Reprodução Equina
          </h1>
          <p className="text-gray-500 mt-1">Gestão de garanhões, éguas e ciclos reprodutivos.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href={`/${tenantId}/equinos/coletas`}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <Droplets size={18} /> Coletas de Sêmen
          </Link>
          <Link 
            href={`/${tenantId}/equinos/ciclos`}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <Heart size={18} /> Ciclos
          </Link>
          <Link 
            href={`/${tenantId}/equinos/novo`}
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
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
              <ClipboardList size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800">{animals.length}</span>
          </div>
          <h3 className="font-bold text-gray-800">Total de Animais</h3>
          <p className="text-sm text-gray-500 mt-1">Garanhões e éguas registrados.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <Droplets size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800">{stallions.length}</span>
          </div>
          <h3 className="font-bold text-gray-800">Garanhões</h3>
          <p className="text-sm text-gray-500 mt-1">Reprodutores ativos.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-pink-100 text-pink-600 rounded-lg">
              <Heart size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800">{mares.length}</span>
          </div>
          <h3 className="font-bold text-gray-800">Éguas</h3>
          <p className="text-sm text-gray-500 mt-1">Doadoras e receptoras.</p>
        </div>
      </div>

      {/* Tabela de Animais */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-800">Animais Registrados</h2>
        </div>
        
        {animals.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Nenhum animal cadastrado</h3>
            <p className="text-gray-500 text-sm">Comece cadastrando um garanhão ou égua.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-medium">Nome</th>
                <th className="px-6 py-3 font-medium">Tipo</th>
                <th className="px-6 py-3 font-medium">Raça</th>
                <th className="px-6 py-3 font-medium">Registro</th>
                <th className="px-6 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {animals.map((animal) => (
                <tr key={animal.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{animal.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      animal.type === 'STALLION' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-pink-100 text-pink-700'
                    }`}>
                      {animal.type === 'STALLION' ? 'Garanhão' : animal.type === 'DONOR' ? 'Doadora' : 'Receptora'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{animal.breed || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{animal.registerNum || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/${tenantId}/equinos/${animal.id}`}
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
