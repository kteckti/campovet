import Link from "next/link"
import { db } from "@/src/lib/db"
// Adicionei History e HouseHeart nos imports
import { Plus, Search, Phone, MapPin, PawPrint, History, HouseHeart } from "lucide-react"
import { EditTutorModal } from "./edit-tutor-modal"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function TutoresPage({ params }: PageProps) {
  const { tenantId } = await params

  // Buscar clientes do banco
  const customers = await db.customer.findMany({
    where: {
      tenant: { slug: tenantId }
    },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { pets: true } } }
  })

  return (
    <div>
      {/* Cabeçalho da Página */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tutores</h1>
          <p className="text-gray-500 text-sm">Gerencie os proprietários dos pets</p>
        </div>
        
        {/* Container dos Botões */}
        <div className="flex gap-3">
          
          {/* Botão Histórico */}
          <Link 
            href={`/${tenantId}/creche/historico`}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <History size={18} />
            Histórico
          </Link>

          {/* Botão Baias */}
          <Link 
            href={`/${tenantId}/creche/baias`}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <HouseHeart size={18} />
            Baias
          </Link>

          {/* Botão Pets */}
          <Link 
            href={`/${tenantId}/creche/pets`}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <PawPrint size={18} />
            Gerenciar Pets
          </Link>

          {/* Botão Novo Tutor (Principal) */}
          <Link 
            href={`/${tenantId}/creche/tutores/novo`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <Plus size={18} />
            Novo Tutor
          </Link>
        </div>
      </div>

      {/* Cartão da Tabela */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* Barra de Filtro */}
        <div className="p-4 border-b border-gray-100 flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou telefone..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tabela */}
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Contato</th>
              <th className="px-6 py-4">Pets</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  Nenhum tutor cadastrado ainda.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin size={10} /> {customer.address || "Sem endereço"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1 text-gray-700">
                        <Phone size={12} /> {customer.phone || "-"}
                      </span>
                      <span className="text-xs text-gray-400">{customer.email}</span>
                      {customer.cpf && <span className="text-[10px] text-gray-400">CPF: {customer.cpf}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {customer._count.pets} Pets
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    
                    <EditTutorModal 
                      customer={customer} 
                      tenantId={tenantId} 
                    />

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