import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { createCustomer } from "@/src/actions/creche"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function NovoTutorPage({ params }: PageProps) {
  const { tenantId } = await params

  const createWithId = createCustomer.bind(null, tenantId)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Cabeçalho Voltar */}
      <div className="mb-6">
        <Link 
          href={`/${tenantId}/creche/tutores`}
          className="text-gray-500 hover:text-gray-800 flex items-center gap-2 text-sm mb-2 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar para lista
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Cadastrar Novo Tutor</h1>
      </div>

      {/* Formulário */}
      <form action={createWithId} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        
        <div className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
            <input 
              name="name"
              required
              type="text" 
              placeholder="Ex: João Silva"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Grid para CPF, Telefone e Email */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* NOVO CAMPO: CPF */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <input 
                name="cpf"
                type="text" 
                placeholder="000.000.000-00"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Whatsapp</label>
              <input 
                name="phone"
                type="text" 
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                name="email"
                type="email" 
                placeholder="email@exemplo.com"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
            <textarea 
              name="address"
              rows={3}
              placeholder="Rua, Número, Bairro, Cidade..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
          </div>
        </div>

        {/* Rodapé do Form */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
          <Link
            href={`/${tenantId}/creche/tutores`}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            Cancelar
          </Link>
          <button 
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
          >
            <Save size={18} />
            Salvar Cadastro
          </button>
        </div>

      </form>
    </div>
  )
}