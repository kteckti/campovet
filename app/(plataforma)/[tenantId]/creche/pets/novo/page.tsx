import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { db } from "@/src/lib/db"
import { PetForm } from "./pet-form" // Importamos o novo componente

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function NovoPetPage({ params }: PageProps) {
  const { tenantId } = await params
  
  // Buscar lista inicial de tutores
  const owners = await db.customer.findMany({
    where: { tenant: { slug: tenantId } },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, phone: true } // Otimizando a busca
  })

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link 
          href={`/${tenantId}/creche/pets`}
          className="text-gray-500 hover:text-gray-800 flex items-center gap-2 text-sm mb-2 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar para lista
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Cadastrar Novo Pet</h1>
      </div>

      {/* Renderizamos o formulário interativo */}
      <PetForm tenantId={tenantId} initialOwners={owners} />
      
    </div>
  )
}