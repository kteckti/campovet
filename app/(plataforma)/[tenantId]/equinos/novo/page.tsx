import { createEquineAnimal } from "@/src/actions/equinos"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function NovoEquinoPage({ params }: PageProps) {
  const { tenantId } = await params

  return (
    <div className="max-w-2xl mx-auto">
      <Link 
        href={`/${tenantId}/equinos`}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ArrowLeft size={18} /> Voltar
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Cadastrar Novo Animal</h1>
        <p className="text-gray-500 mb-6">Registre um garanhão ou égua no sistema.</p>

        <form action={async (formData) => {
          'use server'
          await createEquineAnimal(tenantId, formData)
        }} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Animal *
              </label>
              <input 
                type="text" 
                name="name"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Thunderbolt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <select 
                name="type"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione o tipo</option>
                <option value="STALLION">Garanhão</option>
                <option value="DONOR">Égua Doadora</option>
                <option value="RECIPIENT">Égua Receptora</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raça
              </label>
              <input 
                type="text" 
                name="breed"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Árabe, Quarto de Milha"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Registro
              </label>
              <input 
                type="text" 
                name="registerNum"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: CBRA-123456"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit"
              className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Cadastrar Animal
            </button>
            <Link 
              href={`/${tenantId}/equinos`}
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
