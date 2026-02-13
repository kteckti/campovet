"use client"

import { useState } from "react"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Fuel,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard
} from "lucide-react"
import { markAppointmentAsPaid } from "@/src/actions/pet-sitter"

interface Appointment {
  id: string
  date: string
  time: string
  status: string
  isPaid: boolean
  paymentMethod: string | null
  serviceValue: number
  fuelCost: number
  totalCost: number
  distanceKm: number
  isRecurring: boolean
  pet: {
    id: string
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

interface FinanceiroClientProps {
  appointments: Appointment[]
  tenantId: string
}

export function FinanceiroClient({ appointments, tenantId }: FinanceiroClientProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "paid">("all")
  const [payingAppointment, setPayingAppointment] = useState<Appointment | null>(null)

  // Calcular totais
  const totalReceived = appointments
    .filter(a => a.isPaid)
    .reduce((sum, a) => sum + a.totalCost, 0)

  const totalPending = appointments
    .filter(a => !a.isPaid && a.status !== "CANCELED")
    .reduce((sum, a) => sum + a.totalCost, 0)

  const totalFuelCost = appointments
    .filter(a => a.status !== "CANCELED")
    .reduce((sum, a) => sum + a.fuelCost, 0)

  const totalServiceValue = appointments
    .filter(a => a.isPaid)
    .reduce((sum, a) => sum + a.serviceValue, 0)

  // Filtrar agendamentos
  const filteredAppointments = appointments.filter(a => {
    if (filter === "pending") return !a.isPaid && a.status !== "CANCELED"
    if (filter === "paid") return a.isPaid
    return true
  })

  const handleMarkAsPaid = async (paymentMethod: string) => {
    if (!payingAppointment) return
    await markAppointmentAsPaid(payingAppointment.id, tenantId, paymentMethod)
    setPayingAppointment(null)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("pt-BR")
  }

  const getStatusBadge = (status: string, isPaid: boolean) => {
    if (isPaid) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          <CheckCircle size={12} /> Pago
        </span>
      )
    }
    
    if (status === "CANCELED") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
          <XCircle size={12} /> Cancelado
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
        <Clock size={12} /> Pendente
      </span>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Recebido</h3>
          <p className="text-2xl font-bold text-gray-800">R$ {totalReceived.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
              <Clock size={24} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">A Receber</h3>
          <p className="text-2xl font-bold text-gray-800">R$ {totalPending.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <Fuel size={24} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Gasto com Combustível</h3>
          <p className="text-2xl font-bold text-gray-800">R$ {totalFuelCost.toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <DollarSign size={24} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Lucro Líquido</h3>
          <p className="text-2xl font-bold text-gray-800">
            R$ {(totalServiceValue).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Todos ({appointments.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "pending"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Pendentes ({appointments.filter(a => !a.isPaid && a.status !== "CANCELED").length})
          </button>
          <button
            onClick={() => setFilter("paid")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "paid"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Pagos ({appointments.filter(a => a.isPaid).length})
          </button>
        </div>
      </div>

      {/* Tabela de Agendamentos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Data/Hora</th>
                <th className="px-6 py-4">Cliente/Pet</th>
                <th className="px-6 py-4">Serviço</th>
                <th className="px-6 py-4">Distância</th>
                <th className="px-6 py-4">Combustível</th>
                <th className="px-6 py-4">Valor Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    Nenhum agendamento encontrado
                  </td>
                </tr>
              ) : (
                filteredAppointments.map(appointment => (
                  <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{formatDate(appointment.date)}</div>
                      <div className="text-xs text-gray-500">{appointment.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{appointment.pet.owner.name}</div>
                      <div className="text-xs text-gray-500">{appointment.pet.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {appointment.service.name}
                      {appointment.isRecurring && (
                        <span className="ml-2 text-xs text-purple-600">🔄</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {appointment.distanceKm.toFixed(1)} km
                    </td>
                    <td className="px-6 py-4 text-red-600 font-medium">
                      R$ {appointment.fuelCost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-bold">
                      R$ {appointment.totalCost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(appointment.status, appointment.isPaid)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!appointment.isPaid && appointment.status !== "CANCELED" && (
                        <button
                          onClick={() => setPayingAppointment(appointment)}
                          className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Marcar como Pago
                        </button>
                      )}
                      {appointment.isPaid && appointment.paymentMethod && (
                        <span className="text-xs text-gray-500">
                          {appointment.paymentMethod}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Pagamento */}
      {payingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard size={24} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2 text-center">
                Confirmar Pagamento
              </h3>
              <p className="text-gray-500 text-sm mb-4 text-center">
                Cliente: <strong>{payingAppointment.pet.owner.name}</strong><br />
                Valor: <strong className="text-green-600">R$ {payingAppointment.totalCost.toFixed(2)}</strong>
              </p>
              
              <div className="space-y-2 mb-6">
                <p className="text-sm font-medium text-gray-700">Selecione a forma de pagamento:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleMarkAsPaid("PIX")}
                    className="px-4 py-3 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    PIX
                  </button>
                  <button
                    onClick={() => handleMarkAsPaid("CREDITO")}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Crédito
                  </button>
                  <button
                    onClick={() => handleMarkAsPaid("DEBITO")}
                    className="px-4 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Débito
                  </button>
                  <button
                    onClick={() => handleMarkAsPaid("DINHEIRO")}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Dinheiro
                  </button>
                </div>
              </div>

              <button
                onClick={() => setPayingAppointment(null)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
