import { db } from "@/src/lib/db"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AppointmentForm } from "./appointment-form"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function NovoPetSitterPage({ params }: PageProps) {
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

  const pets = await db.pet.findMany({
    where: { tenant: { slug: tenantId } },
    include: { owner: true },
    orderBy: { name: 'asc' }
  })

  const services = await db.service.findMany({
    where: { tenant: { slug: tenantId } },
    orderBy: { name: 'asc' }
  })

  // Converter Decimal para Number
  const servicesData = services.map(s => ({
    id: s.id,
    name: s.name,
    price: Number(s.price)
  }))

  return (
    <div className="max-w-3xl mx-auto">
      <Link 
        href={`/${tenantId}/pet-sitter`}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 font-medium"
      >
        <ArrowLeft size={18} /> Voltar
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Agendar Nova Visita</h1>
        <p className="text-gray-500 mb-6">Cadastre um novo atendimento de Pet Sitter em domicílio.</p>

        <AppointmentForm 
          tenantId={tenantId}
          pets={pets}
          services={servicesData}
        />
      </div>
    </div>
  )
}
