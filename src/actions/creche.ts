'use server'

import { db } from "@/src/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"


export async function createPet(tenantId: string, formData: FormData) {
  const name = formData.get("name") as string
  const species = formData.get("species") as string // Cão, Gato, etc
  const breed = formData.get("breed") as string
  const ownerId = formData.get("ownerId") as string // ID do Tutor selecionado

  // Tratamento de peso e nascimento (opcionais)
  const weightStr = formData.get("weight") as string
  const weight = weightStr ? parseFloat(weightStr.replace(',', '.')) : null

  const birthDateStr = formData.get("birthDate") as string
  const birthDate = birthDateStr ? new Date(birthDateStr) : null

  if (!name || !ownerId || !species) {
    throw new Error("Nome, Espécie e Tutor são obrigatórios")
  }

  const tenant = await db.tenant.findUnique({
    where: { slug: tenantId }
  })

  if (!tenant) throw new Error("Empresa não encontrada")

  await db.pet.create({
    data: {
      name,
      species,
      breed,
      weight,
      birthDate,
      ownerId,      // Vincula ao Tutor
      tenantId: tenant.id
    }
  })

  revalidatePath(`/${tenantId}/creche/pets`)
  redirect(`/${tenantId}/creche/pets`)
}


export async function createCustomer(tenantId: string, formData: FormData) {
  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const email = formData.get("email") as string
  const address = formData.get("address") as string
  const cpf = formData.get("cpf") as string // <--- Pegar o CPF

  if (!name) throw new Error("Nome é obrigatório")

  const tenant = await db.tenant.findUnique({ where: { slug: tenantId } })
  if (!tenant) throw new Error("Empresa não encontrada")

  await db.customer.create({
    data: {
      name,
      phone,
      email,
      address,
      cpf, // <--- Salvar
      tenantId: tenant.id
    }
  })

  revalidatePath(`/${tenantId}/creche/tutores`)
  redirect(`/${tenantId}/creche/tutores`)
}

// ... createPet continua igual ...

// 2. ATUALIZAR O CADASTRO RÁPIDO (MODAL)
export async function createCustomerQuick(tenantId: string, formData: FormData) {
  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const cpf = formData.get("cpf") as string
  const address = formData.get("address") as string

  if (!name) throw new Error("Nome é obrigatório")

  const tenant = await db.tenant.findUnique({ where: { slug: tenantId } })
  if (!tenant) throw new Error("Empresa não encontrada")

  const newCustomer = await db.customer.create({
    data: {
      name,
      phone,
      cpf,
      address,
      tenantId: tenant.id
    }
  })

  return newCustomer
}

export async function createKennel(tenantId: string, formData: FormData) {
  const name = formData.get("name") as string
  const size = formData.get("size") as string
  const dailyRate = formData.get("dailyRate") as string
  const capacity = formData.get("capacity") as string // <--- Pegar capacidade

  await db.kennel.create({
    data: {
      name,
      size,
      dailyRate: parseFloat(dailyRate),
      capacity: capacity ? parseInt(capacity) : 1, // <--- Salvar
      tenant: { connect: { slug: tenantId } }
    }
  })
  revalidatePath(`/${tenantId}/creche/baias`)
}

export async function updatePetHealth(petId: string, tenantId: string, formData: FormData) {
  const allergies = formData.get("allergies") as string
  const foodRestrictions = formData.get("foodRestrictions") as string
  const vetName = formData.get("vetName") as string
  const vetPhone = formData.get("vetPhone") as string
  const notes = formData.get("notes") as string

  await db.pet.update({
    where: { id: petId },
    data: { allergies, foodRestrictions, vetName, vetPhone, notes }
  })

  revalidatePath(`/${tenantId}/creche/pets/${petId}`)
}

export async function addMedication(petId: string, tenantId: string, formData: FormData) {
  const name = formData.get("name") as string
  const dosage = formData.get("dosage") as string
  const frequency = formData.get("frequency") as string

  if (!name) throw new Error("Nome do remédio obrigatório")

  await db.petMedication.create({
    data: {
      name,
      dosage,
      frequency,
      active: true,
      petId
    }
  })
  revalidatePath(`/${tenantId}/creche/pets/${petId}`)
}

export async function addPetLog(petId: string, tenantId: string, formData: FormData) {
  const type = formData.get("type") as string
  const description = formData.get("description") as string
  const performedBy = formData.get("performedBy") as string // <--- Pegando do Form

  // Validação: Descrição e Responsável são obrigatórios agora
  if (!description || !performedBy) {
    // Em um cenário real, você retornaria um erro, mas aqui vamos apenas ignorar ou lançar
    return;
  }

  await db.petLog.create({
    data: {
      type,
      description,
      performedBy,
      petId
    }
  })
  revalidatePath(`/${tenantId}/creche/pets/${petId}`)
}

export async function deactivateMedication(medicationId: string, tenantId: string, petId: string) {
  await db.petMedication.update({
    where: { id: medicationId },
    data: { active: false } // Marca como inativo
  })

  // Atualiza a tela do Pet
  revalidatePath(`/${tenantId}/creche/pets/${petId}`)
}

export async function checkInPet(tenantId: string, formData: FormData) {
  const kennelId = formData.get("kennelId") as string
  const petId = formData.get("petId") as string

  // 1. Buscar Baia e contar quantos ativos tem
  const kennel = await db.kennel.findUnique({
    where: { id: kennelId },
    include: { 
      bookings: { 
        where: { status: "ACTIVE" } 
      } 
    }
  })

  if (!kennel) throw new Error("Baia não encontrada")

  // 2. VERIFICAR SE CABE MAIS UM
  if (kennel.bookings.length >= kennel.capacity) {
    throw new Error("Baia lotada! Capacidade máxima atingida.")
  }

  // 3. Criar Booking
  await db.booking.create({
    data: {
      status: "ACTIVE",
      startDate: new Date(),
      pet: { connect: { id: petId } },
      kennel: { connect: { id: kennelId } },
      tenant: { connect: { slug: tenantId } }
    }
  })

  // 4. Atualizar status da baia para OCCUPIED (se tiver pelo menos 1, está ocupada)
  // Isso é visual, mas a lógica real agora é baseada na contagem vs capacidade
  await db.kennel.update({
    where: { id: kennelId },
    data: { status: "OCCUPIED" }
  })

  revalidatePath(`/${tenantId}/creche/baias`)
}

export async function checkOutPet(bookingId: string, kennelId: string, tenantId: string) {
  // 1. Buscar dados INCLUINDO OS SERVIÇOS CONSUMIDOS
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { 
      kennel: true,
      services: true 
    }
  })

  if (!booking) throw new Error("Reserva não encontrada")

  // 2. Calcular Diárias
  const endDate = new Date()
  const startDate = new Date(booking.startDate)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) 
  const daysToCharge = diffDays === 0 ? 1 : diffDays

  const dailyTotal = daysToCharge * Number(booking.kennel.dailyRate)

  // 3. Calcular Serviços Extras
  const servicesTotal = booking.services.reduce((acc, item) => acc + Number(item.price), 0)

  // 4. Total Final
  const finalTotal = dailyTotal + servicesTotal

  // 5. Salvar e Finalizar ESTE Booking específico
  await db.booking.update({
    where: { id: bookingId },
    data: {
      status: "COMPLETED",
      endDate: endDate,
      totalCost: finalTotal
    }
  })

  // === 6. NOVA LÓGICA DE CAPACIDADE ===
  // Verifica se sobrou algum animal na baia (status ACTIVE)
  const remainingPets = await db.booking.count({
    where: {
      kennelId: kennelId,
      status: "ACTIVE"
    }
  })

  // Se não sobrou ninguém (0), libera a baia.
  // Se sobrou (> 0), mantém como OCCUPIED.
  if (remainingPets === 0) {
    await db.kennel.update({
      where: { id: kennelId },
      data: { status: "AVAILABLE" }
    })
  } else {
    // Garante que continua ocupada (caso estivesse em outro estado por erro)
    await db.kennel.update({
      where: { id: kennelId },
      data: { status: "OCCUPIED" }
    })
  }

  // 7. Redirecionar para o relatório financeiro
  redirect(`/${tenantId}/creche/checkout/${bookingId}`)
}

export async function updateKennel(kennelId: string, tenantId: string, formData: FormData) {
  const name = formData.get("name") as string
  const size = formData.get("size") as string
  const dailyRate = formData.get("dailyRate") as string
  const capacity = formData.get("capacity") as string // <--- Pegar capacidade

  await db.kennel.update({
    where: { id: kennelId },
    data: {
      name,
      size,
      dailyRate: parseFloat(dailyRate),
      capacity: capacity ? parseInt(capacity) : 1, // <--- Atualizar
    }
  })
  revalidatePath(`/${tenantId}/creche/baias`)
}
// Adicione no final do seu src/actions/creche.ts

export async function deleteKennel(kennelId: string, tenantId: string) {
  try {
    // 1. Verifica se tem algum pet hospedado nela agora
    const kennel = await db.kennel.findUnique({
      where: { id: kennelId },
      include: { bookings: { where: { status: 'ACTIVE' } } }
    });

    if (kennel?.bookings && kennel.bookings.length > 0) {
      throw new Error("Não é possível excluir uma baia que está ocupada.");
    }

    // 2. Tenta deletar
    await db.kennel.delete({
      where: { id: kennelId }
    });

    revalidatePath(`/${tenantId}/creche/baias`);
  } catch (error) {
    console.error("Erro ao deletar baia", error);
    throw new Error("Não é possível deletar esta baia, possivelmente ela já possui histórico de hospedagens vinculadas.");
  }
}

export async function updateCustomer(customerId: string, tenantId: string, formData: FormData) {
  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const email = formData.get("email") as string
  const address = formData.get("address") as string
  const cpf = formData.get("cpf") as string

  if (!name) throw new Error("Nome é obrigatório")

  await db.customer.update({
    where: { id: customerId },
    data: {
      name,
      phone,
      email,
      address,
      cpf
    }
  })

  revalidatePath(`/${tenantId}/creche/tutores`)
}

// === CRIAR (Já existia, mantenha ou atualize o revalidate) ===
export async function createService(tenantId: string, formData: FormData) {
  const name = formData.get("name") as string
  const price = formData.get("price") as string

  await db.service.create({
    data: {
      name,
      price: parseFloat(price),
      tenant: { connect: { slug: tenantId } }
    }
  })
  revalidatePath(`/${tenantId}/servicos`) // Atualiza a nova página
  revalidatePath(`/${tenantId}/creche/baias`) // Atualiza onde é usado
}

// === ATUALIZAR (NOVO) ===
export async function updateService(serviceId: string, tenantId: string, formData: FormData) {
  const name = formData.get("name") as string
  const price = formData.get("price") as string

  await db.service.update({
    where: { id: serviceId },
    data: {
      name,
      price: parseFloat(price)
    }
  })
  revalidatePath(`/${tenantId}/servicos`)
  revalidatePath(`/${tenantId}/creche/baias`)
}

// === DELETAR (NOVO) ===
export async function deleteService(serviceId: string, tenantId: string) {
  // Nota: Em produção, você deve verificar se o serviço já foi usado em algum booking antes de deletar
  try {
    await db.service.delete({
      where: { id: serviceId }
    })
    revalidatePath(`/${tenantId}/servicos`)
    revalidatePath(`/${tenantId}/creche/baias`)
  } catch (error) {
    console.error("Erro ao deletar serviço", error)
    throw new Error("Não é possível deletar este serviço pois ele já está em uso.")
  }
}

// === ADICIONAR SERVIÇO AO PET ===

export async function addServiceToBooking(bookingId: string, serviceId: string, tenantId: string, petId: string) {
  // 1. Buscar o preço atual do serviço
  const service = await db.service.findUnique({ where: { id: serviceId } })
  if (!service) throw new Error("Serviço não existe")

  // 2. Adicionar ao booking gravando o preço atual
  await db.bookingService.create({
    data: {
      bookingId,
      serviceId,
      price: service.price
    }
  })

  revalidatePath(`/${tenantId}/creche/pets/${petId}`)
}
export async function getMorePetLogs(petId: string, skip: number) {
  const logs = await db.petLog.findMany({
    where: { petId },
    orderBy: { date: 'desc' },
    take: 5, // Pega mais 5
    skip: skip // Pula os que já foram mostrados
  })
  return logs
}