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

  // 2. Criar Planos Conforme Solicitação
  
  // Plano Essencial — R$ 149/mês (1 módulo)
  await prisma.plan.upsert({
    where: { id: 'plan_essencial' },
    update: { price: 149.00 },
    create: {
      id: 'plan_essencial',
      name: 'Essencial',
      description: '1 módulo à escolha + Suporte básico',
      price: 149.00,
      isPremium: false,
      allowedModules: [] // Será definido no registro
    }
  })

  // Plano Profissional — R$ 349/mês (Até 3 módulos)
  await prisma.plan.upsert({
    where: { id: 'plan_profissional' },
    update: { price: 349.00 },
    create: {
      id: 'plan_profissional',
      name: 'Profissional',
      description: 'Até 3 módulos + Relatórios avançados + Suporte prioritário',
      price: 349.00,
      isPremium: false,
      allowedModules: [] // Será definido no registro
    }
  })

  // Plano Enterprise — R$ 599/mês (Todos os módulos)
  await prisma.plan.upsert({
    where: { id: 'plan_enterprise' },
    update: { price: 599.00 },
    create: {
      id: 'plan_enterprise',
      name: 'Enterprise',
      description: 'Todos os módulos + Multi-unidade + Usuários ilimitados + Suporte premium',
      price: 599.00,
      isPremium: true,
      allowedModules: allModules.map(m => m.id)
    }
  })

  console.log('✅ Planos atualizados')

  // 3. Criar Tenant de Teste (Clínica Silva)
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'clinica-silva' },
    update: { 
      planId: 'plan_enterprise', 
      subscriptionStatus: 'ACTIVE' 
    },
    create: {
      name: 'Clínica Veterinária Silva',
      slug: 'clinica-silva',
      document: '12345678000199',
      planId: 'plan_enterprise',
      subscriptionStatus: 'ACTIVE'
    }
  })
  console.log(`✅ Tenant: ${tenant.name}`)

  // 4. Ativar Módulos para o Tenant de Teste
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
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
