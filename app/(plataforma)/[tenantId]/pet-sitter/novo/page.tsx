import { db } from "@/src/lib/db"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function NovoPetSitterPage({ params }: PageProps) {
  const { tenantId } = await params

  const pets = await db.pet.findMany({
    where: { tenant: { slug: tenantId } },
    include: { owner: true }
  })

  return (
    <div className="max-w-2xl mx-auto">
      <Link 
        href={`/${tenantId}/pet-sitter`}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 font-medium"
      >
        <ArrowLeft size={18} /> Voltar
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Agendar Nova Visita</h1>
        <p className="text-gray-500 mb-6">Cadastre um novo atendimento de Pet Sitter em domicílio.</p>

        <form className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pet *
            </label>
            <select 
              name="petId"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecione um pet</option>
              {pets.map(pet => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} ({pet.owner.name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data da Visita *
              </label>
              <input 
                type="date" 
                name="date"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horário Previsto *
              </label>
              <input 
                type="time" 
                name="time"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endereço de Atendimento (se diferente do cadastro)
            </label>
            <input 
              type="text" 
              name="address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: Rua das Flores, 123 - Apto 42"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações e Instruções
            </label>
            <textarea 
              name="notes"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Instruções sobre alimentação, chaves, comportamento..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              className="flex-1 bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Confirmar Agendamento
            </button>
            <Link 
              href={`/${tenantId}/pet-sitter`}
              className="flex-1 bg-gray-200 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-300 transition-colors text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
