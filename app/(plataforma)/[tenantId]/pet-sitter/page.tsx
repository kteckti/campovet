import { db } from "@/src/lib/db"
import Link from "next/link"
import { UserCheck } from "lucide-react"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function PetSitterPage({ params }: PageProps) {
  const { tenantId } = await params

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
        <UserCheck className="text-indigo-600" size={32} />
        Módulo Pet Sitter - {tenantId}
      </h1>
      <p className="mt-4 text-gray-600">
        Se você está vendo esta página, a rota está funcionando corretamente.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href={`/${tenantId}/pet-sitter/novo`} className="px-4 py-2 bg-indigo-600 text-white rounded">
          Testar Novo Agendamento
        </Link>
        <Link href={`/${tenantId}/pet-sitter/financeiro`} className="px-4 py-2 bg-green-600 text-white rounded">
          Testar Financeiro
        </Link>
      </div>
    </div>
  )
}
