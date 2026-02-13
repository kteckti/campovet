"use server"

import { db } from "@/src/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"


// Criar Agendamento
export async function createAppointment(tenantId: string, formData: FormData) {
  const petId = formData.get("petId") as string
  const vetId = formData.get("vetId") as string
  const dateStr = formData.get("date") as string // YYYY-MM-DD
  const timeStr = formData.get("time") as string // HH:mm
  const reason = formData.get("reason") as string
  const notes = formData.get("notes") as string

  if (!petId || !vetId || !dateStr || !timeStr || !reason) {
    throw new Error("Preencha os campos obrigatórios")
  }

  // Combina data e hora
  const appointmentDate = new Date(`${dateStr}T${timeStr}:00`)

  await db.appointment.create({
    data: {
      date: appointmentDate,
      reason,
      notes,
      status: "SCHEDULED",
      pet: { connect: { id: petId } },
      veterinarian: { connect: { id: vetId } },
      tenant: { connect: { slug: tenantId } }
    }
  })

  revalidatePath(`/${tenantId}/clinica/agenda`)
}

// Buscar Veterinários (Para o Select)
export async function getVeterinarians(tenantId: string) {
  return await db.user.findMany({
    where: {
      // Se quiser filtrar para trazer apenas quem tem cargo de Veterinário:
      // role: "VETERINARIO", 
      
      // CORREÇÃO AQUI: Usar 'tenant' no singular
      tenant: { slug: tenantId } 
    }
  })
}

// Cancelar Agendamento
export async function cancelAppointment(appointmentId: string, tenantId: string) {
  await db.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELED" }
  })
  revalidatePath(`/${tenantId}/clinica/agenda`)
}

export async function finishConsultation(tenantId: string, appointmentId: string, formData: FormData) {
  const complaint = formData.get("complaint") as string
  const notes = formData.get("notes") as string
  const diagnosis = formData.get("diagnosis") as string
  const prescription = formData.get("prescription") as string
  
  const petId = formData.get("petId") as string
  const vetId = formData.get("vetId") as string

  // 1. Garante que os dados finais sejam salvos (Upsert)
  await db.medicalRecord.upsert({
    where: { appointmentId: appointmentId },
    update: {
      complaint,
      notes,
      diagnosis,
      prescription,
    },
    create: {
      complaint,
      notes,
      diagnosis,
      prescription,
      date: new Date(),
      appointment: { connect: { id: appointmentId } },
      pet: { connect: { id: petId } },
      veterinarian: { connect: { id: vetId } },
      tenant: { connect: { slug: tenantId } }
    }
  })

  // 2. Atualiza o Agendamento para "Concluído"
  await db.appointment.update({
    where: { id: appointmentId },
    data: { status: "COMPLETED" }
  })

  revalidatePath(`/${tenantId}/clinica/agenda`)
  
  // 3. Redireciona para a impressão
  redirect(`/${tenantId}/clinica/prontuario/${appointmentId}`)
}

export async function checkoutAppointment(tenantId: string, formData: FormData) {
  const appointmentId = formData.get("appointmentId") as string
  const amountStr = formData.get("amount") as string
  const paymentType = formData.get("paymentType") as string
  const installments = formData.get("installments") as string
  
  // Captura os serviços selecionados (virá como uma string separada por vírgula ou várias entradas)
  const serviceIdsString = formData.get("serviceIds") as string 
  const serviceIds = serviceIdsString ? serviceIdsString.split(",") : []

  if (!appointmentId || !amountStr) throw new Error("Dados inválidos")

  const amount = parseFloat(amountStr)

  // Formata Pagamento
  let methodFormatted = paymentType
  if (paymentType === "CREDIT") {
    methodFormatted = `Crédito (${installments}x)`
  } else if (paymentType === "DEBIT") methodFormatted = "Débito"
  else if (paymentType === "MONEY") methodFormatted = "Dinheiro"
  else methodFormatted = "PIX"

  // 1. Atualiza o Agendamento (PAGO + Serviços Conectados)
  await db.appointment.update({
    where: { id: appointmentId },
    data: {
      isPaid: true,
      totalCost: amount,
      paymentMethod: methodFormatted,
      // Conecta os serviços selecionados
      services: {
        connect: serviceIds.map(id => ({ id }))
      }
    }
  })

  // 2. Busca dados para a descrição
  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    select: { pet: { select: { name: true } } }
  })

  // 3. Lança no Financeiro
  await db.transaction.create({
    data: {
      type: "INCOME",
      amount: amount,
      description: `Consulta Vet - ${appointment?.pet.name}`,
      module: "CLINICA",
      method: methodFormatted,
      date: new Date(),
      tenant: { connect: { slug: tenantId } },
      appointment: { connect: { id: appointmentId } }
    }
  })

  revalidatePath(`/${tenantId}/clinica/agenda`)
}

export async function reopenAppointment(appointmentId: string, tenantId: string) {
  // Atualiza o status para SCHEDULED para permitir edição na tela de atendimento
  await db.appointment.update({
    where: { id: appointmentId },
    data: { status: "SCHEDULED" }
  })

  // Redireciona imediatamente para a tela de edição
  redirect(`/${tenantId}/clinica/atendimento/${appointmentId}`)
}

export async function saveConsultation(tenantId: string, appointmentId: string, formData: FormData) {
  const complaint = formData.get("complaint") as string
  const notes = formData.get("notes") as string
  const diagnosis = formData.get("diagnosis") as string
  const prescription = formData.get("prescription") as string
  
  const petId = formData.get("petId") as string
  const vetId = formData.get("vetId") as string

  // Cria ou Atualiza o Prontuário (Upsert)
  await db.medicalRecord.upsert({
    where: {
      appointmentId: appointmentId // Procura pelo ID do agendamento
    },
    update: {
      complaint,
      notes,
      diagnosis,
      prescription,
    },
    create: {
      complaint,
      notes,
      diagnosis,
      prescription,
      date: new Date(),
      appointment: { connect: { id: appointmentId } },
      pet: { connect: { id: petId } },
      veterinarian: { connect: { id: vetId } },
      tenant: { connect: { slug: tenantId } }
    }
  })

  // Atualiza status para EM ATENDIMENTO
  await db.appointment.update({
    where: { id: appointmentId },
    data: { status: "IN_PROGRESS" }
  })

  revalidatePath(`/${tenantId}/clinica/atendimento/${appointmentId}`)
}