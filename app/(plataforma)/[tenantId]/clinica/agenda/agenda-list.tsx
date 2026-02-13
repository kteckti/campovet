"use client"

import { useState } from "react"
import Link from "next/link"
import { User2, FileText, DollarSign, Check, PlayCircle } from "lucide-react"
import { ClinicCheckoutModal } from "./clinic-checkout-modal"

interface AgendaListProps {
  appointments: any[]
  tenantSlug: string
  services: any[]
}

export function AgendaList({ appointments, tenantSlug, services }: AgendaListProps) {
  const [checkoutApp, setCheckoutApp] = useState<any>(null)

  // Função auxiliar para definir cores e textos dos status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return { color: 'bg-blue-100 text-blue-700', label: 'Agendado' }
      case 'IN_PROGRESS':
        return { color: 'bg-yellow-100 text-yellow-700', label: 'Em Atendimento' }
      case 'COMPLETED':
        return { color: 'bg-green-100 text-green-700', label: 'Finalizado' }
      default:
        return { color: 'bg-red-100 text-red-700', label: 'Cancelado' }
    }
  }

  return (
    <>
      <div className="space-y-3">
        {appointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-sm">Nenhum agendamento para este dia.</p>
          </div>
        ) : (
          appointments.map((app) => {
            const statusInfo = getStatusBadge(app.status)
            
            return (
              <div key={app.id} className={`bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group ${app.isPaid ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
                
                <div className="flex items-center gap-6">
                  {/* Hora */}
                  <div className="text-center min-w-[80px]">
                    <p className="text-xl font-bold text-gray-800">
                      {new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase inline-block whitespace-nowrap ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="border-l border-gray-100 pl-6">
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      {app.pet.name}
                      {/* Indicador visual de atendimento em andamento */}
                      {app.status === 'IN_PROGRESS' && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <User2 size={12} /> Tutor: {app.pet.owner.name}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                        Dr(a). {app.veterinarian.name}
                      </span>
                      <span>• {app.reason}</span>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2">
                  
                  {/* Botão ATENDER / CONTINUAR */}
                  {app.status !== 'CANCELED' && (
                    <Link 
                      // Se COMPLETED -> Vai pro prontuário (visualizar)
                      // Se SCHEDULED ou IN_PROGRESS -> Vai pro atendimento (editar)
                      href={app.status === 'COMPLETED' 
                        ? `/${tenantSlug}/clinica/prontuario/${app.id}` 
                        : `/${tenantSlug}/clinica/atendimento/${app.id}`
                      }
                      className={`p-2 rounded-lg transition-colors flex flex-col items-center min-w-[60px] 
                        ${app.status === 'IN_PROGRESS' 
                          ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50' 
                          : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'}`
                      } 
                      title={app.status === 'COMPLETED' ? "Ver Prontuário" : "Atender Paciente"}
                    >
                       {app.status === 'IN_PROGRESS' ? <PlayCircle size={20} /> : <FileText size={20} />}
                       <span className="text-[10px] font-bold uppercase mt-1">
                          {app.status === 'COMPLETED' ? "Prontuário" : app.status === 'IN_PROGRESS' ? "Continuar" : "Atender"}
                       </span>
                    </Link>
                  )}

                  {/* Botão PAGAR (Só aparece se Finalizado e Não Pago) */}
                  {app.status === 'COMPLETED' && !app.isPaid && (
                    <button 
                      onClick={() => setCheckoutApp({
                        id: app.id, 
                        petName: app.pet.name, 
                        ownerName: app.pet.owner.name,
                        vetName: app.veterinarian.name
                      })}
                      className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors flex flex-col items-center min-w-[60px] animate-in zoom-in"
                      title="Cobrar Consulta"
                    >
                      <DollarSign size={20} />
                      <span className="text-[10px] font-bold uppercase mt-1">Cobrar</span>
                    </button>
                  )}

                  {/* Selo PAGO */}
                  {app.isPaid && (
                    <div className="text-green-600 p-2 flex flex-col items-center min-w-[60px] opacity-70">
                      <Check size={20} />
                      <span className="text-[10px] font-bold uppercase mt-1">Pago</span>
                    </div>
                  )}

                </div>
              </div>
            )
          })
        )}
      </div>

      <ClinicCheckoutModal 
        isOpen={!!checkoutApp}
        onClose={() => setCheckoutApp(null)}
        appointment={checkoutApp}
        tenantSlug={tenantSlug}
        services={services} 
      />
    </>
  )
}