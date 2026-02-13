import { db } from "@/src/lib/db"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AppointmentForm } from "./appointment-form"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function NovoPetSitterPage({ params }: PageProps) {
  const { tenantId } = await params

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
