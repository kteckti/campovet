"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, Clock, User, PawPrint, MapPin, ChevronLeft, ChevronRight, AlertCircle, Trash2, Edit } from "lucide-react"
import Link from "next/link"

interface Appointment {
  id: string
  date: string
  time: string
  status: string
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
  address: string | null
}

interface AgendaClientProps {
  initialAppointments: Appointment[]
  tenantId: string
}

export function AgendaClient({ initialAppointments, tenantId }: AgendaClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const filteredAppointments = initialAppointments.filter(app => {
    const appDate = new Date(app.date).toISOString().split('T')[0]
    return appDate === selectedDate
  })

  const changeDate = (days: number) => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + days)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00') // evita problemas de fuso
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  return (
    <div className="space-y-6">
      {/* Seletor de Data */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => changeDate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-gray-700"
          />
          <button 
            onClick={() => changeDate(1)}
            className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          <button 
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="ml-2 text-sm text-indigo-600 font-medium hover:underline"
          >
            Ir para Hoje
          </button>
        </div>
        <div className="text-gray-500 font-medium">
          {formatDateDisplay(selectedDate)}
        </div>
      </div>

      {/* Lista de Atendimentos do Dia */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Clock size={18} className="text-indigo-600" />
            Atendimentos do Dia
          </h2>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
            {filteredAppointments.length} {filteredAppointments.length === 1 ? 'visita' : 'visitas'}
          </span>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="p-16 text-center">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-200 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhuma visita para este dia</h3>
            <p className="text-gray-500 text-sm mt-1">Aproveite o tempo livre ou agende um novo cliente.</p>
            <Link 
              href={`/${tenantId}/pet-sitter/novo`}
              className="mt-6 inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Nova Visita
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredAppointments.sort((a, b) => a.time.localeCompare(b.time)).map((app) => (
              <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-lg min-w-[80px] text-center border border-indigo-100">
                    {app.time}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-lg">{app.pet.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">
                        {app.service.name}
                      </span>
                      {app.status === "CANCELED" && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">
                          Cancelado
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <User size={14} />
                        <span>Tutor: {app.pet.owner.name}</span>
                      </div>
                      {app.address && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} />
                          <span>{app.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Editar">
                    <Edit size={18} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cancelar">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
