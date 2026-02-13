import { db } from "@/src/lib/db"
import Link from "next/link"
import { 
  Plus, 
  Calendar, 
  UserCheck, 
  MapPin, 
  Clock,
  History,
  AlertCircle,
  DollarSign
} from "lucide-react"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function PetSitterPage({ params }: PageProps) {
  const { tenantId } = await params

  // Buscar tenant
  const tenant = await db.tenant.findUnique({
    where: { slug: tenantId }
  })

  if (!tenant) {
    return <div>Tenant não encontrado</div>
  }

  // Buscar agendamentos
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const appointmentsToday = await db.petSitterAppointment.count({
    where: { 
      tenantId: tenant.id,
      date: {
        gte: today,
        lt: tomorrow
      },
      status: { not: "CANCELED" }
    }
  })

  const activeRoutes = await db.petSitterAppointment.groupBy({
    by: ['petId'],
    where: {
      tenantId: tenant.id,
      status: { not: "CANCELED" },
      date: { gte: today }
    }
  })

  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const completedThisMonth = await db.petSitterAppointment.count({
    where: {
      tenantId: tenant.id,
      status: "COMPLETED",
      date: { gte: firstDayOfMonth }
    }
  })

  // Próximas visitas
  const upcomingAppointments = await db.petSitterAppointment.findMany({
    where: { 
      tenantId: tenant.id,
      date: { gte: today },
      status: { not: "CANCELED" }
    },
    include: {
      pet: { include: { owner: true } },
      service: true
    },
    orderBy: { date: 'asc' },
    take: 10
  })

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <UserCheck className="text-indigo-600" size={32} />
            Pet Sitter
          </h1>
          <p className="text-gray-500 mt-1">Gestão de visitas e cuidados em domicílio.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href={`/${tenantId}/pet-sitter/financeiro`}
            className="bg-green-600 border border-green-700 text-white hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <DollarSign size={18} /> Financeiro
          </Link>
          <Link 
            href={`/${tenantId}/pet-sitter/agenda`}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <Calendar size={18} /> Agenda de Visitas
          </Link>
          <Link 
            href={`/${tenantId}/pet-sitter/novo`}
            className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <Plus size={18} /> Nova Visita
          </Link>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
              <Clock size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800">{appointmentsToday}</span>
          </div>
          <h3 className="font-bold text-gray-800">Visitas Hoje</h3>
          <p className="text-sm text-gray-500 mt-1">Atendimentos agendados para hoje.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <MapPin size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800">{activeRoutes.length}</span>
          </div>
          <h3 className="font-bold text-gray-800">Rotas Ativas</h3>
          <p className="text-sm text-gray-500 mt-1">Endereços para visitação.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <History size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800">{completedThisMonth}</span>
          </div>
          <h3 className="font-bold text-gray-800">Concluídas (Mês)</h3>
          <p className="text-sm text-gray-500 mt-1">Total de visitas realizadas.</p>
        </div>
      </div>

      {/* Próximas Visitas */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-800">Próximas Visitas Agendadas</h2>
        </div>
        
        {upcomingAppointments.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Nenhuma visita encontrada</h3>
            <p className="text-gray-500 text-sm mb-4">Comece criando seu primeiro agendamento.</p>
            <Link 
              href={`/${tenantId}/pet-sitter/novo`}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus size={18} /> Agendar Primeira Visita
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Data/Hora</th>
                  <th className="px-6 py-3">Cliente</th>
                  <th className="px-6 py-3">Pet</th>
                  <th className="px-6 py-3">Serviço</th>
                  <th className="px-6 py-3">Valor</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {upcomingAppointments.map(appointment => (
                  <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{formatDate(appointment.date)}</div>
                      <div className="text-xs text-gray-500">{appointment.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{appointment.pet.owner.name}</div>
                      {appointment.pet.owner.phone && (
                        <div className="text-xs text-gray-500">{appointment.pet.owner.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{appointment.pet.name}</td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">{appointment.service.name}</span>
                      {appointment.isRecurring && (
                        <span className="ml-2 text-xs text-purple-600" title="Recorrente">🔄</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      R$ {Number(appointment.totalCost).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {appointment.isPaid ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Pago
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                          Pendente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
