"use client"

import { useState } from "react"
import { AlertCircle, Plus, Trash2, Edit, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { cancelAppointment } from "@/src/actions/pet-sitter"

interface Appointment {
  id: string
  date: string
  time: string
  status: string
  isPaid: boolean
  totalCost: number
  isRecurring: boolean
  pet: {
    name: string
    owner: {
      name: string
      phone: string | null
    }
  }
  service: {
    name: string
  }
}

interface DashboardClientProps {
  initialAppointments: Appointment[]
  tenantId: string
}

export function DashboardClient({ initialAppointments, tenantId }: DashboardClientProps) {
  const [showAll, setShowAll] = useState(false)
  const [appointments, setAppointments] = useState(initialAppointments)

  const displayedAppointments = showAll ? appointments : appointments.slice(0, 5)

  const handleCancel = async (id: string) => {
    if (confirm("Tem certeza que deseja cancelar este agendamento?")) {
      try {
        await cancelAppointment(id, tenantId)
        setAppointments(prev => prev.filter(app => app.id !== id))
      } catch (error) {
        alert("Erro ao cancelar agendamento.")
      }
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("pt-BR", { 
      day: '2-digit', 
      month: 'short'
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h2 className="font-bold text-gray-800">Próximas Visitas Agendadas</h2>
        {appointments.length > 5 && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className="text-indigo-600 text-sm font-medium flex items-center gap-1 hover:underline"
          >
            {showAll ? (
              <><ChevronUp size={16} /> Ver Menos</>
            ) : (
              <><ChevronDown size={16} /> Ver Todos ({appointments.length})</>
            )}
          </button>
        )}
      </div>
      
      {appointments.length === 0 ? (
        <div className="p-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Nenhuma visita encontrada</h3>
          <p className="text-gray-500 text-sm mb-4">Comece criando seu primeiro agendamento.</p>
          <Link 
            href={`/${tenantId}/pet-sitter/novo`}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} /> Agendar Primeira Visita
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs border-b border-gray-100">
              <tr>
                <th className="px-6 py-3">Data/Hora</th>
                <th className="px-6 py-3">Pet / Tutor</th>
                <th className="px-6 py-3">Serviço</th>
                <th className="px-6 py-3">Valor</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayedAppointments.map(appointment => (
                <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{formatDate(appointment.date)}</div>
                    <div className="text-xs text-gray-500 font-bold">{appointment.time}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{appointment.pet.name}</div>
                    <div className="text-xs text-gray-500">{appointment.pet.owner.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700">{appointment.service.name}</span>
                    {appointment.isRecurring && (
                      <span className="ml-2 text-xs text-purple-600" title="Recorrente">🔄</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    R$ {Number(appointment.totalCost).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {appointment.isPaid ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Pago
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        title="Reagendar / Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleCancel(appointment.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Cancelar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
