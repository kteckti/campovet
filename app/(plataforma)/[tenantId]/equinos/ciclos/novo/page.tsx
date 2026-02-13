import { createReproductiveCycle } from "@/src/actions/equinos"
import { db } from "@/src/lib/db"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function NovoCicloPage({ params }: PageProps) {
  const { tenantId } = await params

  const mares = await db.equineAnimal.findMany({
    where: { 
      tenant: { slug: tenantId },
      type: { in: ['DONOR', 'RECIPIENT'] }
    }
  })

  return (
    <div className="max-w-2xl mx-auto">
      <Link 
        href={`/${tenantId}/equinos/ciclos`}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ArrowLeft size={18} /> Voltar
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Iniciar Novo Ciclo</h1>
        <p className="text-gray-500 mb-6">Selecione uma égua para iniciar o acompanhamento reprodutivo.</p>

        <form action={async (formData) => {
          'use server'
          await createReproductiveCycle(tenantId, formData)
        }} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Égua (Doadora ou Receptora) *
            </label>
            <select 
              name="animalId"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione uma égua</option>
              {mares.map(mare => (
                <option key={mare.id} value={mare.id}>
                  {mare.name} ({mare.type === 'DONOR' ? 'Doadora' : 'Receptora'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Início
            </label>
            <input 
              type="date" 
              name="startDate"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit"
              className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Iniciar Ciclo
            </button>
            <Link 
              href={`/${tenantId}/equinos/ciclos`}
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
