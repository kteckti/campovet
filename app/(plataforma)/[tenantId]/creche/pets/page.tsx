import Link from "next/link"
import { db } from "@/src/lib/db"
import { Plus, Search, PawPrint, User, Users, HouseHeart, History} from "lucide-react"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function PetsPage({ params }: PageProps) {
  const { tenantId } = await params

  // Buscar Pets (Incluindo os dados do Dono para mostrar na tabela)
  const pets = await db.pet.findMany({
    where: { tenant: { slug: tenantId } },
    orderBy: { createdAt: 'desc' },
    include: { owner: true }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pets</h1>
          <p className="text-gray-500 text-sm">Gerencie os animais cadastrados</p>
        </div>

        <div className="flex gap-3">

          <Link
            href={`/${tenantId}/creche/historico`}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <History size={18} />
            Histórico
          </Link>

          <Link
            href={`/${tenantId}/creche/baias`}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <HouseHeart size={18} />
            Baias
          </Link>

          <Link
            href={`/${tenantId}/creche/tutores`}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <Users size={18} />
            Gerenciar Tutores
          </Link>

          {/* Botão Principal */}
          <Link
            href={`/${tenantId}/creche/pets/novo`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <Plus size={18} />
            Novo Pet
          </Link>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Barra de busca simples */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar pet..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Nome do Pet</th>
              <th className="px-6 py-4">Espécie / Raça</th>
              <th className="px-6 py-4">Tutor</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pets.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  Nenhum pet cadastrado.
                </td>
              </tr>
            ) : (
              pets.map((pet) => (
                <tr key={pet.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                        <PawPrint size={16} />
                      </div>
                      <span className="font-medium text-gray-900">{pet.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">{pet.species}</p>
                    <p className="text-xs text-gray-400">{pet.breed || "Raça não informada"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User size={14} />
                      {pet.owner.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/${tenantId}/creche/pets/${pet.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Ficha Médica
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}