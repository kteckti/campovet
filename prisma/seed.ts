import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Criar os Módulos Disponíveis
  const modules = [
    { id: 'mod_creche', name: 'Creche & Hotel Pet', description: 'Gestão de hospedagem e day care' },
    { id: 'mod_pet_sitter', name: 'Pet Sitter', description: 'Gestão de atendimentos domiciliares' },
    { id: 'mod_clinica', name: 'Clínica Veterinária', description: 'Prontuário e internação' },
    { id: 'mod_equinos', name: 'Reprodução Equina', description: 'Controle de garanhões e éguas' },
    { id: 'mod_leite', name: 'Gado Leiteiro', description: 'Produção e lactação' },
    { id: 'mod_corte', name: 'Gado de Corte', description: 'Engorda e pesagem' },
    { id: 'mod_ovinos', name: 'Ovinocultura', description: 'Gestão de ovinos' },
  ]

  for (const mod of modules) {
    await prisma.module.upsert({
      where: { id: mod.id },
      update: {},
      create: mod,
    })
  }

  console.log('Módulos padrão criados com sucesso!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })