import { db } from "@/src/lib/db"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AppointmentForm } from "../../novo/appointment-form"

interface PageProps {
  params: Promise<{ tenantId: string; appointmentId: string }>
}

export default async function EditarPetSitterPage({ params }: PageProps) {
  const { tenantId, appointmentId } = await params

  // Buscar agendamento
  const appointment = await db.petSitterAppointment.findUnique({
    where: { id: appointmentId },
    include: {
      pet: { include: { owner: true } },
      service: true
    }
  })

  if (!appointment) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-xl">
        <h2 className="text-red-800 font-bold text-lg">Agendamento não encontrado</h2>
        <p className="text-red-600 mt-2">O agendamento solicitado não foi encontrado.</p>
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

  const servicesData = services.map(s => ({
    id: s.id,
    name: s.name,
    price: Number(s.price)
  }))

  // Preparar dados iniciais para o formulário
  const initialData = {
    id: appointment.id,
    petId: appointment.petId,
    serviceId: appointment.serviceId,
    date: appointment.date.toISOString().split('T')[0],
    time: appointment.time,
    distanceKm: appointment.distanceKm.toString(),
    address: appointment.address || "",
    notes: appointment.notes || "",
    isRecurring: appointment.isRecurring,
    recurrencePattern: appointment.recurrencePattern || "",
    recurrenceEndDate: appointment.recurrenceEndDate ? appointment.recurrenceEndDate.toISOString().split('T')[0] : ""
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link 
        href={`/${tenantId}/pet-sitter`}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 font-medium"
      >
        <ArrowLeft size={18} /> Voltar
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Editar Agendamento</h1>
        <p className="text-gray-500 mb-6">Atualize as informações do atendimento de Pet Sitter.</p>

        <AppointmentForm 
          tenantId={tenantId}
          pets={pets}
          services={servicesData}
          initialData={initialData}
        />
      </div>
    </div>
  )
}
