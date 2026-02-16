import { db } from "@/src/lib/db"
import Link from "next/link"
import { 
  ArrowLeft,
  Calendar as CalendarIcon,
  Plus
} from "lucide-react"
import { AgendaClient } from "./agenda-client"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function AgendaPetSitterPage({ params }: PageProps) {
  const { tenantId } = await params

  // Buscar todos os agendamentos do tenant (o componente cliente filtra por data)
  const appointments = await db.petSitterAppointment.findMany({
    where: { 
      tenant: { slug: tenantId },
      status: { not: "CANCELED" }
    },
    include: {
      pet: {
        include: {
          owner: true
        }
      },
      service: true
    },
    orderBy: [
      { date: 'asc' },
      { time: 'asc' }
    ]
  })

  // Serializar datas para o componente cliente
  const serializedAppointments = appointments.map(app => ({
    id: app.id,
    date: app.date.toISOString(),
    time: app.time,
    status: app.status,
    isRecurring: app.isRecurring,
    pet: {
      name: app.pet.name,
      owner: {
        name: app.pet.owner.name,
        phone: app.pet.owner.phone
      }
    },
    service: {
      name: app.service.name
    },
    address: app.address
  }))

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between mb-6">
        <Link 
          href={`/${tenantId}/pet-sitter`}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <ArrowLeft size={18} /> Voltar para Dashboard
        </Link>

        <Link 
          href={`/${tenantId}/pet-sitter/novo`}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors text-sm font-bold shadow-sm"
        >
          <Plus size={18} /> Novo Agendamento
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <CalendarIcon className="text-indigo-600" size={32} />
          Agenda de Visitas
        </h1>
        <p className="text-gray-500 mt-1">Visualize e organize os atendimentos domiciliares por data.</p>
      </div>

      <AgendaClient 
        initialAppointments={serializedAppointments} 
        tenantId={tenantId} 
      />
    </div>
  )
}
