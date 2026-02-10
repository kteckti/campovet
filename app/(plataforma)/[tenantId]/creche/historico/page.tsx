import Link from "next/link"
import { db } from "@/src/lib/db"
import { Search, ArrowLeft, FileText, CalendarCheck, CalendarX } from "lucide-react"

interface PageProps {
  params: Promise<{ tenantId: string }>
  searchParams: Promise<{ q?: string }> // Recebe o parâmetro de busca da URL
}

export default async function HistoricoPage({ params, searchParams }: PageProps) {
  const { tenantId } = await params
  const { q } = await searchParams // Termo de busca

  // Construir o filtro de busca
  const whereClause: any = {
    tenant: { slug: tenantId }
  }

  // Se tiver busca, filtra por Nome do Pet OU Nome do Tutor
  if (q) {
    whereClause.OR = [
      { pet: { name: { contains: q, mode: 'insensitive' } } }, // Postgres mode: insensitive
      { pet: { owner: { name: { contains: q, mode: 'insensitive' } } } }
    ]
  }

  // Buscar Reservas (Bookings)
  const bookings = await db.booking.findMany({
    where: whereClause,
    orderBy: { startDate: 'desc' }, // Mais recentes primeiro
    include: {
      pet: {
        include: { owner: true }
      },
      kennel: true
    }
  })

  return (
    <div>
      {/* Cabeçalho com Voltar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <Link 
            href={`/${tenantId}/creche/pets`}
            className="text-gray-500 hover:text-gray-800 flex items-center gap-2 text-sm mb-2 transition-colors"
          >
            <ArrowLeft size={16} /> Voltar para Pets
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Histórico de Hospedagem</h1>
          <p className="text-gray-500 text-sm">Consulte check-ins passados e reimprima relatórios</p>
        </div>

        {/* Formulário de Busca (Server Side via URL) */}
        <form className="relative max-w-md w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            name="q" // O nome 'q' vai para a URL como ?q=valor
            defaultValue={q}
            type="text" 
            placeholder="Buscar por Tutor ou Pet..." 
            className="w-full md:w-80 pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          />
        </form>
      </div>

      {/* Tabela de Histórico */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Paciente / Tutor</th>
              <th className="px-6 py-4">Acomodação</th>
              <th className="px-6 py-4">Período</th>
              <th className="px-6 py-4 text-right">Documento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  {q ? "Nenhum registro encontrado para essa busca." : "Nenhum histórico de hospedagem registrado."}
                </td>
              </tr>
            ) : (
              bookings.map((booking) => {
                const isCompleted = booking.status === "COMPLETED"
                const startDate = new Date(booking.startDate)
                const endDate = booking.endDate ? new Date(booking.endDate) : null

                return (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        isCompleted 
                          ? "bg-gray-100 text-gray-700 border-gray-200" 
                          : "bg-green-100 text-green-700 border-green-200"
                      }`}>
                        {isCompleted ? <CalendarCheck size={12} /> : <CalendarX size={12} />}
                        {isCompleted ? "Finalizado" : "Hospedado"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-900">{booking.pet.name}</p>
                        <p className="text-xs text-gray-500">Tutor: {booking.pet.owner.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-800">
                      {booking.kennel.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs">
                        <span className="text-green-700 font-medium">
                          Ent: {startDate.toLocaleDateString()} {startDate.toLocaleTimeString().slice(0,5)}
                        </span>
                        {endDate ? (
                          <span className="text-red-700 font-medium mt-0.5">
                            Sai: {endDate.toLocaleDateString()} {endDate.toLocaleTimeString().slice(0,5)}
                          </span>
                        ) : (
                          <span className="text-gray-400 mt-0.5 italic">-- em aberto --</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isCompleted ? (
                        <Link 
                          href={`/${tenantId}/creche/checkout/${booking.id}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-transparent hover:border-blue-100"
                          title="Visualizar/Imprimir Relatório"
                        >
                          <FileText size={16} />
                          Ver Nota
                        </Link>
                      ) : (
                         <span className="text-xs text-gray-400 italic">Em andamento</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}