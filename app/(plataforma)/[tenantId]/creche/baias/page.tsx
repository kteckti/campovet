import Link from "next/link"
import { db } from "@/src/lib/db"
import { Box, History, PawPrint, Users } from "lucide-react"
import { KennelModal } from "./kennel-modal"
import { KennelCard } from "./kennel-card"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function BaiasPage({ params }: PageProps) {
  const { tenantId } = await params

  // 1. Buscar serviços (Raw = Dados brutos com Decimal)
  const servicesRaw = await db.service.findMany({
    where: { tenant: { slug: tenantId } },
    orderBy: { name: 'asc' }
  })

  // 2. Converter Decimal para Number para o componente Cliente não quebrar
  // Isso resolve o erro "Decimal objects are not supported"
  const services = servicesRaw.map(service => ({
    ...service,
    price: Number(service.price)
  }))

  // 3. Buscar baias com o Booking ATIVO incluso
  const kennels = await db.kennel.findMany({
    where: { tenant: { slug: tenantId } },
    orderBy: { name: 'asc' },
    include: {
      bookings: {
        where: { status: "ACTIVE" },
        include: {
          pet: { include: { owner: true } }
        }
      }
    }
  })

  // 4. Buscar Pets para o Select (Lista Geral)
  const pets = await db.pet.findMany({
    where: { tenant: { slug: tenantId } },
    orderBy: { name: 'asc' },
    include: { owner: true }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Baias & Acomodações</h1>
          <p className="text-gray-500 text-sm">Controle de ocupação em tempo real</p>
        </div>

        {/* CONTAINER DE BOTÕES DE NAVEGAÇÃO */}
        <div className="flex gap-3">
          
          <Link href={`/${tenantId}/creche/historico`} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium">
            <History size={18} /> Histórico
          </Link>

          <Link href={`/${tenantId}/creche/pets`} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium">
            <PawPrint size={18} /> Gerenciar Pets
          </Link>

          <Link href={`/${tenantId}/creche/tutores`} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium">
            <Users size={18} /> Gerenciar Tutores
          </Link>


          {/* Botão Principal */}
          <KennelModal tenantId={tenantId} />
        </div>
      </div>

      {kennels.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <Box className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Nenhuma baia cadastrada</h3>
          <p className="text-gray-500 text-sm">Cadastre os canis para começar a hospedar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {kennels.map((kennel) => (
            <KennelCard
              key={kennel.id}
              kennel={{
                ...kennel,
                dailyRate: Number(kennel.dailyRate) // Conversão que já existia
              }}
              pets={pets}
              tenantSlug={tenantId}
            />
          ))}
        </div>
      )}
    </div>
  )
}