import { db } from "@/src/lib/db"
import Link from "next/link"
import { 
  ArrowLeft,
  Calendar as CalendarIcon,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function AgendaPetSitterPage({ params }: PageProps) {
  const { tenantId } = await params

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href={`/${tenantId}/pet-sitter`}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <ArrowLeft size={18} /> Voltar
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <CalendarIcon className="text-indigo-600" size={32} />
            Agenda de Visitas
          </h1>
          <p className="text-gray-500 mt-1">Visualize e organize os atendimentos domiciliares.</p>
        </div>
        
        <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <button className="p-2 hover:bg-gray-50 rounded-md text-gray-600">
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 font-semibold text-gray-700">Fevereiro 2026</span>
          <button className="p-2 hover:bg-gray-50 rounded-md text-gray-600">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Visualização de Agenda (Placeholder) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <div className="max-w-md mx-auto">
          <CalendarIcon className="mx-auto h-16 w-16 text-indigo-100 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Sua agenda está livre</h2>
          <p className="text-gray-500 mb-6">
            Não há visitas agendadas para este período. Clique no botão abaixo para criar o primeiro atendimento.
          </p>
          <Link 
            href={`/${tenantId}/pet-sitter/novo`}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            Agendar Primeira Visita
          </Link>
        </div>
      </div>

      {/* Lista de Próximos Eventos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-gray-800">Próximos Atendimentos</h2>
        </div>
        <div className="p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">Nenhum atendimento pendente para exibição em lista.</p>
        </div>
      </div>
    </div>
  )
}
