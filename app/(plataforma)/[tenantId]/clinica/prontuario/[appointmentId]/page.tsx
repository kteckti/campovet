import { db } from "@/src/lib/db"
import { ProntuarioViewer } from "./prontuario-viewer"

interface PageProps {
  params: Promise<{ tenantId: string; appointmentId: string }>
}

export default async function ProntuarioPrintPage({ params }: PageProps) {
  const { tenantId, appointmentId } = await params

  // Buscar dados completos
  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      medicalRecord: true,
      pet: { include: { owner: true } },
      veterinarian: true,
      tenant: true 
    }
  })

  if (!appointment || !appointment.medicalRecord) {
    return <div className="p-8 text-center text-red-500">Prontuário não encontrado.</div>
  }

  // Prepara o objeto de dados para o Client Component
  const data = {
    appointmentId: appointment.id,
    tenant: appointment.tenant,
    pet: appointment.pet,
    veterinarian: appointment.veterinarian,
    medicalRecord: appointment.medicalRecord
  }

  return <ProntuarioViewer data={data} tenantSlug={tenantId} />
}