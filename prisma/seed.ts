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
  const plans = [
    {
      id: 'plan_essencial',
      name: 'Essencial',
      description: '1 módulo à escolha + Suporte básico',
      price: 149.00,
      isPremium: false,
      allowedModules: []
    },
    {
      id: 'plan_profissional',
      name: 'Profissional',
      description: 'Até 3 módulos + Relatórios avançados + Suporte prioritário',
      price: 349.00,
      isPremium: false,
      allowedModules: []
    },
    {
      id: 'plan_enterprise',
      name: 'Enterprise',
      description: 'Todos os módulos + Multi-unidade + Usuários ilimitados + Suporte premium',
      price: 599.00,
      isPremium: true,
      allowedModules: allModules.map(m => m.id)
    }
  ]

  for (const p of plans) {
    await prisma.plan.upsert({
      where: { id: p.id },
      update: { price: p.price, description: p.description, isPremium: p.isPremium, allowedModules: p.allowedModules },
      create: p
    })
  }
  console.log('✅ Planos atualizados')

  // 3. Criar Tenant Administrativo Central (Obrigatório para o SuperAdmin)
  const adminTenant = await prisma.tenant.upsert({
    where: { slug: 'admin' },
    update: {},
    create: {
      name: 'CampoVet Administração',
      slug: 'admin',
      document: '00000000000000',
      planId: 'plan_enterprise',
      subscriptionStatus: 'ACTIVE'
    }
  })
  console.log(`✅ Tenant Administrativo: ${adminTenant.name}`)

  // 4. Criar Usuário SuperAdmin (kteckti@gmail.com)
  const hashedAdminPassword = await bcrypt.hash('admin123', 10) // Senha padrão inicial
  
  await prisma.user.upsert({
    where: { email: 'kteckti@gmail.com' },
    update: { name: 'kteck' },
    create: {
      email: 'kteckti@gmail.com',
      name: 'kteck',
      password: hashedAdminPassword,
      role: 'GERENTE',
      tenantId: adminTenant.id
    }
  })
  console.log('✅ SuperAdmin (kteckti@gmail.com) criado/atualizado')

  // 5. Criar Tenant de Teste (Clínica Silva)
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
  console.log(`✅ Tenant de Teste: ${tenant.name}`)

  // 6. Ativar Módulos para os Tenants
  const tenantsToActivate = [adminTenant.id, tenant.id]
  for (const tId of tenantsToActivate) {
    for (const mod of allModules) {
      await prisma.tenantModule.upsert({
        where: {
          tenantId_moduleId: {
            tenantId: tId,
            moduleId: mod.id
          }
        },
        update: { isActive: true },
        create: {
          tenantId: tId,
          moduleId: mod.id,
          isActive: true
        }
      })
    }
  }

  console.log('✅ Seed finalizado com sucesso!')
  console.log('🚀 ACESSO ADMIN:')
  console.log('📧 Email: kteckti@gmail.com')
  console.log('🔑 Senha: admin123 (Recomendado trocar após o primeiro login)')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
