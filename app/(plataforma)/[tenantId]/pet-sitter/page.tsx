import { db } from "@/src/lib/db"
import Link from "next/link"
import { 
  Plus, 
  Calendar, 
  UserCheck, 
  MapPin, 
  Clock,
  History,
  AlertCircle
} from "lucide-react"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function PetSitterPage({ params }: PageProps) {
  const { tenantId } = await params

  // No momento, o Pet Sitter usa a base de Clientes e Pets geral do sistema
  const appointments = await db.booking.findMany({
    where: { 
      tenant: { slug: tenantId },
      // Aqui poderíamos filtrar por um tipo específico se houvesse no banco, 
      // mas por enquanto listaremos os agendamentos gerais para demonstração
    },
    include: {
      pet: { include: { owner: true } }
    },
    orderBy: { startDate: 'desc' },
    take: 10
  })

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <UserCheck className="text-indigo-600" size={32} />
            Pet Sitter
          </h1>
          <p className="text-gray-500 mt-1">Gestão de visitas e cuidados em domicílio.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href={`/${tenantId}/pet-sitter/agenda`}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <Calendar size={18} /> Agenda de Visitas
          </Link>
          <Link 
            href={`/${tenantId}/pet-sitter/novo`}
            className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <Plus size={18} /> Nova Visita
          </Link>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
              <Clock size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800">0</span>
          </div>
          <h3 className="font-bold text-gray-800">Visitas Hoje</h3>
          <p className="text-sm text-gray-500 mt-1">Atendimentos agendados para hoje.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <MapPin size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800">0</span>
          </div>
          <h3 className="font-bold text-gray-800">Rotas Ativas</h3>
          <p className="text-sm text-gray-500 mt-1">Endereços para visitação.</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <History size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800">0</span>
          </div>
          <h3 className="font-bold text-gray-800">Concluídas (Mês)</h3>
          <p className="text-sm text-gray-500 mt-1">Total de visitas realizadas.</p>
        </div>
      </div>

      {/* Próximas Visitas */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-800">Próximas Visitas Agendadas</h2>
        </div>
        
        <div className="p-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Nenhuma visita encontrada</h3>
          <p className="text-gray-500 text-sm">Os agendamentos de Pet Sitter aparecerão aqui.</p>
        </div>
      </div>
    </div>
  )
}
