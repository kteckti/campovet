import { recordWeighing } from "@/src/actions/pecuaria"
import { db } from "@/src/lib/db"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function NovaPesagemPage({ params }: PageProps) {
  const { tenantId } = await params

  const animals = await db.beefAnimal.findMany({
    where: { tenant: { slug: tenantId } },
    include: { lot: true }
  })

  return (
    <div className="max-w-2xl mx-auto">
      <Link 
        href={`/${tenantId}/gado-corte/pesagens`}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ArrowLeft size={18} /> Voltar
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Registrar Pesagem</h1>
        <p className="text-gray-500 mb-6">Registre o peso de um animal.</p>

        <form action={async (formData) => {
          'use server'
          await recordWeighing(tenantId, formData)
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
                  {animal.tag} {animal.lot && `- Lote ${animal.lot.name}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Peso (kg) *
            </label>
            <input 
              type="number" 
              name="weight"
              step="0.1"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 450.5"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit"
              className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Registrar Pesagem
            </button>
            <Link 
              href={`/${tenantId}/gado-corte/pesagens`}
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
