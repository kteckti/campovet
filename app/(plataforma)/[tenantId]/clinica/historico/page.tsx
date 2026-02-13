import { db } from "@/src/lib/db"
import Link from "next/link"
import { ArrowLeft, Search, FileText, RotateCcw, Calendar, User } from "lucide-react"
import { reopenAppointment } from "@/src/actions/clinica"

interface PageProps {
  params: Promise<{ tenantId: string }>
  searchParams: Promise<{ q?: string }>
}

export default async function HistoricoPage({ params, searchParams }: PageProps) {
  const { tenantId } = await params
  const { q } = await searchParams

  // Busca agendamentos finalizados ou cancelados
  const appointments = await db.appointment.findMany({
    where: {
      tenant: { slug: tenantId },
      status: { in: ["COMPLETED", "CANCELED"] }, // Apenas histórico
      OR: q ? [
        { pet: { name: { contains: q, mode: 'insensitive' } } },
        { pet: { owner: { name: { contains: q, mode: 'insensitive' } } } }
      ] : undefined
    },
    include: {
      pet: { include: { owner: true } },
      veterinarian: true
    },
    orderBy: { date: 'desc' }, // Mais recentes primeiro
    take: 50 // Limite para não pesar a página
  })

  return (
    <div className="max-w-6xl mx-auto">
      
      {/* Cabeçalho */}
      <div className="mb-8">
        <Link 
          href={`/${tenantId}/clinica`}
          className="text-gray-500 hover:text-gray-800 flex items-center gap-2 mb-4 transition-colors"
        >
          <ArrowLeft size={20} /> Voltar para Central
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="text-blue-600" /> Histórico de Atendimentos
        </h1>
        <p className="text-gray-500 text-sm">Consulte prontuários antigos ou reabra atendimentos.</p>
      </div>

      {/* Busca */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
        <form className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            name="q"
            defaultValue={q}
            placeholder="Buscar por nome do paciente ou tutor..." 
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg outline-blue-500 text-sm"
          />
        </form>
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">Nenhum histórico encontrado.</p>
          </div>
        ) : (
          appointments.map((app) => (
            <div key={app.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${app.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{app.pet.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <User size={12} /> Tutor: {app.pet.owner.name}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {new Date(app.date).toLocaleDateString()} às {new Date(app.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      Dr(a). {app.veterinarian.name}
                    </span>
                    <span className={`px-2 py-1 rounded font-bold ${app.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {app.status === 'COMPLETED' ? 'Finalizado' : 'Cancelado'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4">
                {/* Botão Ver Prontuário */}
                <Link 
                  href={`/${tenantId}/clinica/prontuario/${app.id}`}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileText size={16} /> Ver Prontuário
                </Link>

                {/* Botão Reabrir (Action) */}
                {app.status === 'COMPLETED' && (
                  <form action={async () => {
                    "use server"
                    await reopenAppointment(app.id, tenantId)
                  }}>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-sm font-medium hover:bg-orange-100 flex items-center gap-2"
                      title="Permite editar o prontuário novamente"
                    >
                      <RotateCcw size={16} /> Reabrir / Editar
                    </button>
                  </form>
                )}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  )
}