import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed completo...')

  // 1. Criar/Garantir Módulos
  const allModules = [
    { id: 'mod_creche', name: 'Creche Pet' },
    { id: 'mod_clinica', name: 'Clínica Vet' },
    { id: 'mod_pet_sitter', name: 'Pet Sitter' },
    { id: 'mod_leite', name: 'Gado Leiteiro' },
    { id: 'mod_corte', name: 'Gado de Corte' },
    { id: 'mod_equinos', name: 'Reprodução Equina' }
  ]
  
  for (const m of allModules) {
    await prisma.module.upsert({
        where: { id: m.id },
        update: {},
        create: { id: m.id, name: m.name }
    })
  }
  console.log('✅ Módulos garantidos')

  // 2. Criar Planos
  await prisma.plan.upsert({
    where: { id: 'plan_premium' },
    update: {},
    create: {
      id: 'plan_premium',
      name: 'Premium',
      description: 'Acesso total a todos os módulos',
      price: 299.90,
      isPremium: true,
      allowedModules: []
    }
  })

  await prisma.plan.upsert({
    where: { id: 'plan_pet_sitter' },
    update: {},
    create: {
      id: 'plan_pet_sitter',
      name: 'Pet Sitter Individual',
      description: 'Acesso exclusivo ao módulo Pet Sitter',
      price: 49.90,
      isPremium: false,
      allowedModules: ['mod_pet_sitter']
    }
  })
  console.log('✅ Planos criados')

  // 3. Criar Tenant de Teste
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'clinica-silva' },
    update: { 
      planId: 'plan_premium', 
      subscriptionStatus: 'ACTIVE' 
    },
    create: {
      name: 'Clínica Veterinária Silva',
      slug: 'clinica-silva',
      document: '12345678000199',
      planId: 'plan_premium',
      subscriptionStatus: 'ACTIVE'
    }
  })
  console.log(`✅ Tenant: ${tenant.name}`)

  // 4. Ativar Módulos para o Tenant
  for (const mod of allModules) {
    await prisma.tenantModule.upsert({
      where: {
        tenantId_moduleId: {
          tenantId: tenant.id,
          moduleId: mod.id
        }
      },
      update: { isActive: true },
      create: {
        tenantId: tenant.id,
        moduleId: mod.id,
        isActive: true
      }
    })
  }

  // 5. Criar Usuário Administrador
  const hashedPassword = await bcrypt.hash('123456', 10)
  
  await prisma.user.upsert({
    where: { email: 'admin@campovet.com' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@campovet.com',
      name: 'Administrador Silva',
      password: hashedPassword,
      role: 'GERENTE',
      tenantId: tenant.id
    }
  })

  console.log('✅ Seed finalizado com sucesso!')
  console.log('---------------------------------')
  console.log('📧 E-mail: admin@campovet.com')
  console.log('🔑 Senha: 123456')
  console.log('---------------------------------')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
