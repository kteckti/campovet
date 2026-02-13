import { createSemenCollection } from "@/src/actions/equinos"
import { db } from "@/src/lib/db"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function NovaColetaPage({ params }: PageProps) {
  const { tenantId } = await params

  const stallions = await db.equineAnimal.findMany({
    where: { 
      tenant: { slug: tenantId },
      type: 'STALLION'
    }
  })

  return (
    <div className="max-w-2xl mx-auto">
      <Link 
        href={`/${tenantId}/equinos/coletas`}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ArrowLeft size={18} /> Voltar
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Registrar Nova Coleta</h1>
        <p className="text-gray-500 mb-6">Registre uma coleta de sêmen com análise de qualidade.</p>

        <form action={async (formData) => {
          'use server'
          await createSemenCollection(tenantId, formData)
        }} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Garanhão *
            </label>
            <select 
              name="stallionId"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um garanhão</option>
              {stallions.map(stallion => (
                <option key={stallion.id} value={stallion.id}>
                  {stallion.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volume (ml)
              </label>
              <input 
                type="number" 
                name="volume"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Concentração (esp/ml)
              </label>
              <input 
                type="number" 
                name="concentration"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 500000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motilidade (%)
              </label>
              <input 
                type="number" 
                name="motility"
                min="0"
                max="100"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 75"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea 
              name="observations"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Anotações sobre a coleta..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit"
              className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Registrar Coleta
            </button>
            <Link 
              href={`/${tenantId}/equinos/coletas`}
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
