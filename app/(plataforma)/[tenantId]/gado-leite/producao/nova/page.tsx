import { recordMilkProduction } from "@/src/actions/pecuaria"
import { db } from "@/src/lib/db"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function NovaProducaoPage({ params }: PageProps) {
  const { tenantId } = await params

  const animals = await db.dairyAnimal.findMany({
    where: { tenant: { slug: tenantId } }
  })

  return (
    <div className="max-w-2xl mx-auto">
      <Link 
        href={`/${tenantId}/gado-leite/producao`}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ArrowLeft size={18} /> Voltar
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Registrar Produção</h1>
        <p className="text-gray-500 mb-6">Registre a produção de leite do dia.</p>

        <form action={async (formData) => {
          'use server'
          await recordMilkProduction(tenantId, formData)
        }} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Animal *
            </label>
            <select 
              name="animalId"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um animal</option>
              {animals.map(animal => (
                <option key={animal.id} value={animal.id}>
                  {animal.tag} {animal.name && `- ${animal.name}`}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade (Litros) *
              </label>
              <input 
                type="number" 
                name="amount"
                step="0.1"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 25.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período *
              </label>
              <select 
                name="period"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione o período</option>
                <option value="MANHA">Manhã</option>
                <option value="TARDE">Tarde</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit"
              className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Registrar Produção
            </button>
            <Link 
              href={`/${tenantId}/gado-leite/producao`}
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
