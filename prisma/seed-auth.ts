import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando Seed de Autenticação e Planos...')

  // 1. Criar Planos
  const planPremium = await prisma.plan.upsert({
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

  const planPetSitter = await prisma.plan.upsert({
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

  // 2. Criar Tenant de Teste
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'clinica-silva' },
    update: { planId: 'plan_premium', subscriptionStatus: 'ACTIVE' },
    create: {
      name: 'Clínica Veterinária Silva',
      slug: 'clinica-silva',
      document: '12345678000199',
      planId: 'plan_premium',
      subscriptionStatus: 'ACTIVE'
    }
  })

  // 3. Criar Usuário de Teste
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
  console.log('📧 Usuário: admin@campovet.com')
  console.log('🔑 Senha: 123456')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
