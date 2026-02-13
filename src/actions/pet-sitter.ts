"use server"

import { db } from "@/src/lib/db"
import { revalidatePath } from "next/cache"

/**
 * Cria um novo agendamento de Pet Sitter
 */
export async function createPetSitterAppointment(tenantId: string, formData: FormData) {
  const petId = formData.get("petId") as string
  const serviceId = formData.get("serviceId") as string
  const date = formData.get("date") as string
  const time = formData.get("time") as string
  const distanceKm = formData.get("distanceKm") as string
  const address = formData.get("address") as string
  const notes = formData.get("notes") as string
  const isRecurring = formData.get("isRecurring") === "true"
  const recurrencePattern = formData.get("recurrencePattern") as string
  const recurrenceEndDate = formData.get("recurrenceEndDate") as string

  // Buscar tenant
  const tenant = await db.tenant.findUnique({
    where: { slug: tenantId }
  })

  if (!tenant) {
    throw new Error("Tenant não encontrado")
  }

  // Buscar serviço para obter o valor
  const service = await db.service.findUnique({
    where: { id: serviceId }
  })

  if (!service) {
    throw new Error("Serviço não encontrado")
  }

  const serviceValue = Number(service.price)
  
  // Calcular custo de combustível (Ida e Volta)
  // Gasolina: R$ 6,50 / Consumo: 6km/l = R$ 1,083 por KM
  // Ida e Volta = Distância * 2
  const fuelCostPerKm = 6.50 / 6 
  const distance = distanceKm ? parseFloat(distanceKm) : 0
  const totalDistance = distance * 2 // Ida e Volta
  const fuelCost = totalDistance * fuelCostPerKm
  const totalCost = serviceValue + fuelCost

  // Criar agendamento principal
  const appointment = await db.petSitterAppointment.create({
    data: {
      tenantId: tenant.id,
      petId,
      serviceId,
      date: new Date(date),
      time,
      distanceKm: distance,
      fuelCost,
      serviceValue,
      totalCost,
      address: address || null,
      notes: notes || null,
      isRecurring,
      recurrencePattern: isRecurring ? recurrencePattern : null,
      recurrenceEndDate: isRecurring && recurrenceEndDate ? new Date(recurrenceEndDate) : null,
      status: "SCHEDULED"
    }
  })

  // Se for recorrente, criar as ocorrências futuras
  if (isRecurring && recurrencePattern && recurrenceEndDate) {
    await createRecurringAppointments(
      tenant.id,
      appointment.id,
      petId,
      serviceId,
      new Date(date),
      time,
      recurrencePattern,
      new Date(recurrenceEndDate),
      distance, // Passa a distância original (1 via)
      fuelCost,
      serviceValue,
      totalCost,
      address,
      notes
    )
  }

  revalidatePath(`/${tenantId}/pet-sitter`)
  revalidatePath(`/${tenantId}/pet-sitter/agenda`)
  revalidatePath(`/${tenantId}/pet-sitter/financeiro`)
}

/**
 * Cria os agendamentos recorrentes baseado no padrão
 */
async function createRecurringAppointments(
  tenantId: string,
  parentId: string,
  petId: string,
  serviceId: string,
  startDate: Date,
  time: string,
  pattern: string,
  endDate: Date,
  distanceKm: number,
  fuelCost: number,
  serviceValue: number,
  totalCost: number,
  address: string | null,
  notes: string | null
) {
  // Extrair dias da semana do padrão (ex: "WEEKLY_MON_WED_FRI")
  const daysOfWeek = pattern.split("_").slice(1).map(day => {
    const dayMap: { [key: string]: number } = {
      SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6
    }
    return dayMap[day]
  })

  const appointments = []
  let currentDate = new Date(startDate)
  currentDate.setDate(currentDate.getDate() + 1) // Começa no dia seguinte

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay()
    
    if (daysOfWeek.includes(dayOfWeek)) {
      appointments.push({
        tenantId,
        petId,
        serviceId,
        date: new Date(currentDate),
        time,
        distanceKm,
        fuelCost,
        serviceValue,
        totalCost,
        address,
        notes,
        isRecurring: true,
        recurrencePattern: pattern,
        parentAppointmentId: parentId,
        status: "SCHEDULED"
      })
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  if (appointments.length > 0) {
    await db.petSitterAppointment.createMany({
      data: appointments
    })
  }
}

/**
 * Atualiza o status de um agendamento
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  tenantId: string,
  status: string
) {
  await db.petSitterAppointment.update({
    where: { id: appointmentId },
    data: { status }
  })

  revalidatePath(`/${tenantId}/pet-sitter`)
  revalidatePath(`/${tenantId}/pet-sitter/agenda`)
  revalidatePath(`/${tenantId}/pet-sitter/financeiro`)
}

/**
 * Marca um agendamento como pago
 */
export async function markAppointmentAsPaid(
  appointmentId: string,
  tenantId: string,
  paymentMethod: string
) {
  const appointment = await db.petSitterAppointment.findUnique({
    where: { id: appointmentId },
    include: { pet: { include: { owner: true } }, service: true }
  })

  if (!appointment) {
    throw new Error("Agendamento não encontrado")
  }

  // Atualizar agendamento
  await db.petSitterAppointment.update({
    where: { id: appointmentId },
    data: {
      isPaid: true,
      paymentMethod,
      status: "COMPLETED"
    }
  })

  // Criar transação financeira
  await db.transaction.create({
    data: {
      tenantId: appointment.tenantId,
      type: "INCOME",
      amount: appointment.totalCost,
      description: `Pet Sitter - ${appointment.service.name} - ${appointment.pet.name}`,
      date: new Date(),
      module: "PET_SITTER",
      method: paymentMethod,
      petSitterAppointmentId: appointmentId
    }
  })

  revalidatePath(`/${tenantId}/pet-sitter`)
  revalidatePath(`/${tenantId}/pet-sitter/agenda`)
  revalidatePath(`/${tenantId}/pet-sitter/financeiro`)
  revalidatePath(`/${tenantId}/financeiro`)
}

/**
 * Cancela um agendamento
 */
export async function cancelAppointment(appointmentId: string, tenantId: string) {
  await db.petSitterAppointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELED" }
  })

  revalidatePath(`/${tenantId}/pet-sitter`)
  revalidatePath(`/${tenantId}/pet-sitter/agenda`)
  revalidatePath(`/${tenantId}/pet-sitter/financeiro`)
}

/**
 * Exclui um agendamento
 */
export async function deleteAppointment(appointmentId: string, tenantId: string) {
  await db.petSitterAppointment.delete({
    where: { id: appointmentId }
  })

  revalidatePath(`/${tenantId}/pet-sitter`)
  revalidatePath(`/${tenantId}/pet-sitter/agenda`)
  revalidatePath(`/${tenantId}/pet-sitter/financeiro`)
}
