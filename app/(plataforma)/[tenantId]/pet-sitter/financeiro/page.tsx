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
