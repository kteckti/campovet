import { db } from "@/src/lib/db"
import Link from "next/link"
import { 
  Plus, 
  Calendar, 
  UserCheck, 
  MapPin, 
  Clock,
  History,
  DollarSign
} from "lucide-react"
import { DashboardClient } from "./dashboard-client"
// 1. Importar o Modal de Novo Paciente (reutilizando o da clínica ou criando um compartilhado)
// Se o arquivo estiver em /clinica/components, o ideal seria movê-lo para /components/shared
// Mas vou assumir que você vai importar de onde ele está agora:
import { NewPatientModal } from "./new-client-modal" 

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
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-xl">
        <h2 className="text-red-800 font-bold text-lg">Tenant não encontrado</h2>
        <p className="text-red-600 mt-2">A empresa "{tenantId}" não foi encontrada no sistema.</p>
      </div>
    )
  }

  // Verificação de segurança para o Prisma Client
  if (!(db as any).petSitterAppointment) {
    return (
      <div className="p-8 text-center bg-amber-50 border border-amber-200 rounded-xl">
        <h2 className="text-amber-800 font-bold text-lg">Configuração Necessária</h2>
        <p className="text-amber-600 mt-2">
          O modelo PetSitterAppointment não foi encontrado no banco de dados. 
          Por favor, execute os comandos abaixo no seu terminal:
        </p>
        <pre className="bg-slate-800 text-slate-100 p-4 rounded-lg mt-4 text-sm overflow-x-auto text-left">
          npx prisma migrate dev --name add_pet_sitter_module{"\n"}
          npx prisma generate
        </pre>
      </div>
    )
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

  // Buscar TODAS as próximas visitas (o cliente faz o slice inicial de 5)
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
    orderBy: [
      { date: 'asc' },
      { time: 'asc' }
    ]
  })

  // Serializar para o cliente
  const serializedAppointments = upcomingAppointments.map(app => ({
    id: app.id,
    date: app.date.toISOString(),
    time: app.time,
    status: app.status,
    isPaid: app.isPaid,
    totalCost: Number(app.totalCost),
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
    }
  }))

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
        
        <div className="flex items-center gap-3 flex-wrap">
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
            <Calendar size={18} /> Agenda
          </Link>
          
          {/* 2. Botão de Novo Paciente (Modal) */}
          <NewPatientModal tenantSlug={tenantId} />

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

      {/* Próximas Visitas (Componente Cliente) */}
      <DashboardClient initialAppointments={serializedAppointments} tenantId={tenantId} />
    </div>
  )
}