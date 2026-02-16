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

  const tenant = await db.tenant.findUnique({ where: { slug: tenantId } })
  if (!tenant) throw new Error("Tenant não encontrado")

  const service = await db.service.findUnique({ where: { id: serviceId } })
  if (!service) throw new Error("Serviço não encontrado")

  const serviceValue = Number(service.price)
  const fuelCostPerKm = 6.50 / 6 
  const distance = distanceKm ? parseFloat(distanceKm) : 0
  const totalDistance = distance * 2
  const fuelCost = totalDistance * fuelCostPerKm
  const totalCost = serviceValue + fuelCost

  const appointment = await db.petSitterAppointment.create({
    data: {
      tenantId: tenant.id,
      petId,
      serviceId,
      date: new Date(date + 'T12:00:00'),
      time,
      distanceKm: distance,
      fuelCost,
      serviceValue,
      totalCost,
      address: address || null,
      notes: notes || null,
      isRecurring,
      recurrencePattern: isRecurring ? recurrencePattern : null,
      recurrenceEndDate: isRecurring && recurrenceEndDate ? new Date(recurrenceEndDate + 'T12:00:00') : null,
      status: "SCHEDULED"
    }
  })

  if (isRecurring && recurrencePattern && recurrenceEndDate) {
    await createRecurringAppointments(
      tenant.id,
      appointment.id,
      petId,
      serviceId,
      new Date(date + 'T12:00:00'),
      time,
      recurrencePattern,
      new Date(recurrenceEndDate + 'T12:00:00'),
      distance,
      fuelCost,
      serviceValue,
      totalCost,
      address,
      notes
    )
  }

  revalidatePath(`/${tenantId}/pet-sitter`)
  revalidatePath(`/${tenantId}/pet-sitter/agenda`)
}

/**
 * Atualiza um agendamento existente
 */
export async function updatePetSitterAppointment(id: string, tenantId: string, formData: FormData) {
  const petId = formData.get("petId") as string
  const serviceId = formData.get("serviceId") as string
  const date = formData.get("date") as string
  const time = formData.get("time") as string
  const distanceKm = formData.get("distanceKm") as string
  const address = formData.get("address") as string
  const notes = formData.get("notes") as string

  const service = await db.service.findUnique({ where: { id: serviceId } })
  if (!service) throw new Error("Serviço não encontrado")

  const serviceValue = Number(service.price)
  const fuelCostPerKm = 6.50 / 6 
  const distance = distanceKm ? parseFloat(distanceKm) : 0
  const totalDistance = distance * 2
  const fuelCost = totalDistance * fuelCostPerKm
  const totalCost = serviceValue + fuelCost

  await db.petSitterAppointment.update({
    where: { id },
    data: {
      petId,
      serviceId,
      date: new Date(date + 'T12:00:00'),
      time,
      distanceKm: distance,
      fuelCost,
      serviceValue,
      totalCost,
      address: address || null,
      notes: notes || null
    }
  })

  revalidatePath(`/${tenantId}/pet-sitter`)
  revalidatePath(`/${tenantId}/pet-sitter/agenda`)
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
  const daysOfWeek = pattern.split("_").slice(1).map(day => {
    const dayMap: { [key: string]: number } = {
      SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6
    }
    return dayMap[day]
  })

  const appointments = []
  let currentDate = new Date(startDate)
  currentDate.setDate(currentDate.getDate() + 1)

  while (currentDate <= endDate) {
    if (daysOfWeek.includes(currentDate.getDay())) {
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
    await db.petSitterAppointment.createMany({ data: appointments })
  }
}

export async function cancelAppointment(appointmentId: string, tenantId: string) {
  await db.petSitterAppointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELED" }
  })
  revalidatePath(`/${tenantId}/pet-sitter`)
}

export async function markAppointmentAsPaid(appointmentId: string, tenantId: string, paymentMethod: string) {
  const appointment = await db.petSitterAppointment.findUnique({
    where: { id: appointmentId },
    include: { pet: true, service: true }
  })

  if (!appointment) throw new Error("Agendamento não encontrado")

  await db.petSitterAppointment.update({
    where: { id: appointmentId },
    data: { isPaid: true, paymentMethod, status: "COMPLETED" }
  })

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
  revalidatePath(`/${tenantId}/pet-sitter/financeiro`)
}
