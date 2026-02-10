import Link from "next/link"
import { db } from "@/src/lib/db"
import { ArrowLeft } from "lucide-react"
import { ServicesClient } from "./services-client"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function ServicesPage({ params }: PageProps) {
  const { tenantId } = await params

  // 1. Buscar serviços no banco
  const servicesRaw = await db.service.findMany({
    where: { tenant: { slug: tenantId } },
    orderBy: { name: 'asc' }
  })

  // 2. Converter Decimal para Number (evita erro de serialização do Next.js)
  const services = servicesRaw.map(s => ({
    ...s,
    price: Number(s.price)
  }))

  return (
    <div className="max-w-5xl mx-auto">
      
      {/* Cabeçalho da Página */}
      <div className="mb-8">
        <Link 
          href={`/${tenantId}/creche/baias`}
          className="text-gray-500 hover:text-gray-800 flex items-center gap-2 text-sm mb-2 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar para Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Gestão de Serviços</h1>
        <p className="text-gray-500 mt-1">Configure os serviços adicionais disponíveis no seu estabelecimento.</p>
      </div>

      {/* Componente Cliente (Tabela + Modais) */}
      <ServicesClient 
        initialServices={services} 
        tenantId={tenantId} 
      />

    </div>
  )
}