import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // 1. Criar/Atualizar Clínica
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'clinica-silva' },
    update: {},
    create: {
      name: 'Clínica Veterinária Silva',
      slug: 'clinica-silva',
      document: '12345678000199',
    }
  })

  console.log(`✅ Tenant: ${tenant.name}`)

  // 2. Garantir que módulos existem (caso tenha limpado o banco)
  const allModules = [
    { id: 'mod_creche', name: 'Creche Pet' },
    { id: 'mod_clinica', name: 'Clínica Vet' }
  ]
  
  for (const m of allModules) {
    await prisma.module.upsert({
        where: { id: m.id },
        update: {},
        create: { id: m.id, name: m.name }
    })
  }

  // 3. Ativar Módulos para a Clínica
  const modulesToActivate = ['mod_creche', 'mod_clinica']

  for (const modId of modulesToActivate) {
    await prisma.tenantModule.upsert({
      where: {
        tenantId_moduleId: {
          tenantId: tenant.id,
          moduleId: modId
        }
      },
      update: { isActive: true },
      create: {
        tenantId: tenant.id,
        moduleId: modId,
        isActive: true
      }
    })
  }
  
  console.log(`✅ Módulos vinculados com sucesso!`)
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })