import { db } from "@/src/lib/db"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { FinanceiroClient } from "./financeiro-client"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function FinanceiroPetSitterPage({ params }: PageProps) {
  const { tenantId } = await params

  // Buscar tenant
  const tenant = await db.tenant.findUnique({
    where: { slug: tenantId }
  })

  if (!tenant) {
    return <div>Tenant não encontrado</div>
  }

  // Buscar todos os agendamentos
  const appointments = await db.petSitterAppointment.findMany({
    where: { tenantId: tenant.id },
    include: {
      pet: {
        include: {
          owner: true
        }
      },
      service: true
    },
    orderBy: { date: 'desc' }
  })

  // Converter Decimal para Number
  const appointmentsData = appointments.map(a => ({
    id: a.id,
    date: a.date.toISOString(),
    time: a.time,
    status: a.status,
    isPaid: a.isPaid,
    paymentMethod: a.paymentMethod,
    serviceValue: Number(a.serviceValue),
    fuelCost: a.fuelCost ? Number(a.fuelCost) : 0,
    totalCost: Number(a.totalCost),
    distanceKm: a.distanceKm ? Number(a.distanceKm) : 0,
    isRecurring: a.isRecurring,
    pet: {
      id: a.pet.id,
      name: a.pet.name,
      owner: {
        name: a.pet.owner.name,
        phone: a.pet.owner.phone
      }
    },
    service: {
      name: a.service.name
    }
  }))

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href={`/${tenantId}/pet-sitter`}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <ArrowLeft size={18} /> Voltar
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-800">Organização Financeira</h1>
        <p className="text-gray-500 mt-1">Gestão de valores a receber e gastos com combustível.</p>
      </div>

      <FinanceiroClient 
        appointments={appointmentsData}
        tenantId={tenantId}
      />
    </div>
  )
}
