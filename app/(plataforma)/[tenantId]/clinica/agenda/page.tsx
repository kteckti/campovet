import { db } from "@/src/lib/db"
import Link from "next/link"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { AppointmentModal } from "./appointment-modal"
import { getVeterinarians } from "@/src/actions/clinica"
import { AgendaList } from "./agenda-list"

interface PageProps {
  params: Promise<{ tenantId: string }>
  searchParams: Promise<{ date?: string }>
}

export default async function AgendaPage({ params, searchParams }: PageProps) {
  const { tenantId } = await params
  const { date } = await searchParams

  const currentDate = date ? new Date(date + "T00:00:00") : new Date()
  const dateStr = currentDate.toISOString().split('T')[0]

  const prevDate = new Date(currentDate)
  prevDate.setDate(prevDate.getDate() - 1)
  const prevDateStr = prevDate.toISOString().split('T')[0]

  const nextDate = new Date(currentDate)
  nextDate.setDate(nextDate.getDate() + 1)
  const nextDateStr = nextDate.toISOString().split('T')[0]

  // 1. Buscar Veterinários
  const vets = await getVeterinarians(tenantId)

  // 2. BUSCAR SERVIÇOS DO CATÁLOGO (NOVO)
  const rawServices = await db.service.findMany({
    where: { tenant: { slug: tenantId } },
    orderBy: { name: 'asc' }
  })

  // Converte Decimal para Number (Next.js Client Component não aceita Decimal)
  const services = rawServices.map(s => ({
    ...s,
    price: Number(s.price)
  }))

  // 3. Busca os Agendamentos do dia
  const rawAppointments = await db.appointment.findMany({
    where: {
      tenant: { slug: tenantId },
      date: {
        gte: new Date(dateStr + "T00:00:00"),
        lte: new Date(dateStr + "T23:59:59")
      }
    },
    include: {
      pet: { include: { owner: true } },
      veterinarian: true
    },
    orderBy: { date: 'asc' }
  })

  // Converte Decimal para Number (TotalCost do agendamento)
  const appointments = rawAppointments.map(app => ({
    ...app,
    totalCost: app.totalCost ? Number(app.totalCost) : 0
  }))

  return (
    <div className="max-w-5xl mx-auto">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-blue-600" /> Agenda Clínica
          </h1>
          <p className="text-gray-500 text-sm">Gerencie as consultas e atendimentos.</p>
        </div>
        <AppointmentModal tenantSlug={tenantId} veterinarians={vets} />
      </div>

      {/* Navegador de Data */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between mb-6">
        <Link href={`/${tenantId}/clinica/agenda?date=${prevDateStr}`} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
          <ChevronLeft />
        </Link>
        
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-800 capitalize">
            {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            {appointments.length} Consultas Agendadas
          </p>
        </div>

        <Link href={`/${tenantId}/clinica/agenda?date=${nextDateStr}`} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
          <ChevronRight />
        </Link>
      </div>

      {/* Lista (Componente Cliente) passando os serviços agora */}
      <AgendaList 
        appointments={appointments} 
        tenantSlug={tenantId} 
        services={services} 
      />

    </div>
  )
}