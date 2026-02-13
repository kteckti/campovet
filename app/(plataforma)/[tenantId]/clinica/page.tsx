import { db } from "@/src/lib/db"
import Link from "next/link"
import { 
  Calendar, 
  Activity, 
  Package, 
  AlertTriangle, 
  Stethoscope, 
  ClipboardList,
  Siren,
  History
} from "lucide-react"
// IMPORTAR O NOVO MODAL
import { NewPatientModal } from "./components/new-patient-modal"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function ClinicaDashboard({ params }: PageProps) {
  const { tenantId } = await params

  // ... (MANTENHA TODO O CÓDIGO DE BUSCA DE DADOS IGUAL) ...
  const todayStart = new Date()
  todayStart.setHours(0,0,0,0)
  const todayEnd = new Date()
  todayEnd.setHours(23,59,59,999)

  const todayAppointments = await db.appointment.count({
    where: {
      tenant: { slug: tenantId },
      date: { gte: todayStart, lte: todayEnd },
      status: { not: "CANCELED" }
    }
  })

  const waitingPatients = await db.appointment.count({
    where: {
      tenant: { slug: tenantId },
      date: { gte: todayStart, lte: todayEnd },
      status: "SCHEDULED"
    }
  })

  const allProducts = await db.product.findMany({
    where: { tenant: { slug: tenantId } },
    select: { quantity: true, minStock: true }
  })
  const lowStockItems = allProducts.filter(p => p.quantity <= p.minStock).length


  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Stethoscope className="text-blue-600" size={32} />
            Central Clínica
          </h1>
          <p className="text-gray-500 mt-1">Visão geral do dia e ações rápidas.</p>
        </div>
        
        {/* === AQUI ESTÁ O NOVO BOTÃO === */}
        <div className="flex items-center gap-3">
           <NewPatientModal tenantSlug={tenantId} />
        </div>
      </div>

      {/* === ATALHOS RÁPIDOS === */}
      {/* ... (MANTENHA O RESTO DA PÁGINA IGUAL) ... */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ... Seus cards de Agenda, Emergência, Estoque e Histórico ... */}
        {/* (Vou omitir o código repetido para economizar espaço, mas mantenha tudo que já estava aqui) */}
        
        {/* 1. AGENDA */}
        <Link 
          href={`/${tenantId}/clinica/agenda`}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Calendar size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800">{todayAppointments}</span>
          </div>
          <h3 className="font-bold text-gray-800">Agenda & Consultas</h3>
          <p className="text-sm text-gray-500 mt-1">Ver agendamentos.</p>
          {waitingPatients > 0 && (
            <div className="mt-3 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded inline-block">
              {waitingPatients} na fila
            </div>
          )}
        </Link>

        {/* 2. EMERGÊNCIA */}
        <Link 
          href={`/${tenantId}/clinica/emergencia`}
          className="bg-red-50 p-6 rounded-xl border border-red-200 shadow-sm hover:shadow-md hover:bg-red-100 transition-all group cursor-pointer relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 bg-red-200 w-24 h-24 rounded-full opacity-50 blur-xl"></div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 bg-red-200 text-red-700 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
              <Siren size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-white/50 px-2 py-1 rounded">
              Prioridade
            </span>
          </div>
          <h3 className="font-bold text-red-800 relative z-10">Emergência</h3>
          <p className="text-sm text-red-600/80 mt-1 relative z-10">
            Atendimento imediato.
          </p>
        </Link>

        {/* 3. ESTOQUE */}
        <Link 
          href={`/${tenantId}/clinica/estoque`}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Package size={24} />
            </div>
            {lowStockItems > 0 && (
              <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                <AlertTriangle size={12} /> {lowStockItems} Baixo
              </div>
            )}
          </div>
          <h3 className="font-bold text-gray-800">Estoque</h3>
          <p className="text-sm text-gray-500 mt-1">Farmácia e Insumos.</p>
        </Link>

        {/* 4. HISTÓRICO */}
        <Link 
          href={`/${tenantId}/clinica/historico`}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <History size={24} />
            </div>
          </div>
          <h3 className="font-bold text-gray-800">Histórico</h3>
          <p className="text-sm text-gray-500 mt-1">Prontuários anteriores.</p>
        </Link>
      </div>

      {/* === VISÃO GERAL DE ALERTAS E TAREFAS === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Resumo Financeiro */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-gray-400" /> Métricas Clínicas
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Consultas Realizadas (Mês)</span>
              <span className="font-bold text-gray-900">--</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Ticket Médio (Estimado)</span>
              <span className="font-bold text-gray-900">R$ --</span>
            </div>
          </div>
        </div>

        {/* Links Secundários */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
           <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ClipboardList size={18} className="text-gray-400" /> Cadastros & Configurações
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href={`/${tenantId}/servicos`} className="p-3 text-sm border rounded-lg hover:bg-gray-50 text-gray-600 hover:text-blue-600 transition-colors text-center">
              Catálogo de Serviços
            </Link>
            <Link href={`/${tenantId}/clientes`} className="p-3 text-sm border rounded-lg hover:bg-gray-50 text-gray-600 hover:text-blue-600 transition-colors text-center">
              Base de Clientes
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}