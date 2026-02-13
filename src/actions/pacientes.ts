"use server"

import { db } from "@/src/lib/db"
import { revalidatePath } from "next/cache"

export async function registerPatientAndTutor(tenantId: string, formData: FormData) {
  // Dados do Tutor
  const tutorName = formData.get("tutorName") as string
  const phone = formData.get("phone") as string
  const cpf = formData.get("cpf") as string
  
  // Dados do Pet
  const petName = formData.get("petName") as string
  const species = formData.get("species") as string
  const breed = formData.get("breed") as string
  const gender = formData.get("gender") as string 
  const birthDateStr = formData.get("birthDate") as string

  if (!tutorName || !phone || !petName) {
    throw new Error("Preencha os campos obrigatórios (Tutor, Telefone e Nome do Pet)")
  }

  // 1. Cria o Tutor (Customer)
  const customer = await db.customer.create({
    data: {
      name: tutorName,
      phone,
      cpf,
      tenant: { connect: { slug: tenantId } }
    }
  })

  // 2. Cria o Pet vinculado ao Tutor
  await db.pet.create({
    data: {
      name: petName,
      species,
      breed,
      birthDate: birthDateStr ? new Date(birthDateStr) : null,
      
      // === CORREÇÃO AQUI ===
      // Seu schema define o campo como 'owner', não 'customer'
      owner: { connect: { id: customer.id } }, 
      
      tenant: { connect: { slug: tenantId } }
      
      // Obs: Se você não tem campo 'gender' no banco, ele será ignorado aqui.
      // Se quiser salvar, adicione 'gender' no schema ou salve em 'notes'.
    }
  })

  revalidatePath(`/${tenantId}/clinica`)
  revalidatePath(`/${tenantId}/clinica/agenda`)
  revalidatePath(`/${tenantId}/clientes`)
}