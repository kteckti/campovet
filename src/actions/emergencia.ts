"use server"

import { db } from "@/src/lib/db"
import { redirect } from "next/navigation"

export async function createEmergencyAppointment(tenantId: string, formData: FormData) {
  const vetId = formData.get("vetId") as string
  const tutorName = formData.get("tutorName") as string
  const petName = formData.get("petName") as string
  const species = formData.get("species") as string
  const complaint = formData.get("complaint") as string // Queixa principal

  if (!vetId || !tutorName || !petName) {
    throw new Error("Preencha os campos obrigatórios")
  }

  // 1. Cria o Tutor (Usando a tabela Customer existente)
  // Criamos com dados mínimos para agilizar o atendimento.
  const customer = await db.customer.create({
    data: {
      name: tutorName,
      phone: "(00) 00000-0000", // Telefone provisório
      email: null,             
      address: "Cadastro de Emergência",
      tenant: { connect: { slug: tenantId } }
    }
  })

  // 2. Cria o Pet vinculado ao Customer
  const pet = await db.pet.create({
    data: {
      name: petName,
      species: species,
      // AQUI ESTÁ O AJUSTE: O seu schema chama a relação de 'owner', mesmo apontando para Customer
      owner: { connect: { id: customer.id } }, 
      tenant: { connect: { slug: tenantId } }
    }
  })

  // 3. Cria o Agendamento para AGORA
  const appointment = await db.appointment.create({
    data: {
      date: new Date(), // Data atual exata
      reason: `EMERGÊNCIA: ${complaint}`,
      status: "SCHEDULED", // Cria como agendado para aparecer na lista e permitir "Atender"
      pet: { connect: { id: pet.id } },
      veterinarian: { connect: { id: vetId } },
      tenant: { connect: { slug: tenantId } }
    }
  })

  // 4. Redireciona direto para a tela de Atendimento (Prontuário)
  redirect(`/${tenantId}/clinica/atendimento/${appointment.id}`)
}