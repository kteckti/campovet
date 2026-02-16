"use client"

import { useState, useMemo } from "react"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Fuel,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  FileText,
  Search,
  Calendar as CalendarIcon,
  Download
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
  
  // Estados para o Relatório
  const [reportOwnerName, setReportOwnerName] = useState<string>("")
  const [reportStartDate, setReportStartDate] = useState<string>(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
  })
  const [reportEndDate, setReportEndDate] = useState<string>(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
  })

  // Lista de tutores únicos para o filtro
  const owners = useMemo(() => {
    const uniqueOwners = new Set<string>()
    appointments.forEach(a => uniqueOwners.add(a.pet.owner.name))
    return Array.from(uniqueOwners).sort()
  }, [appointments])

  // Dados do Relatório Filtrados
  const reportData = useMemo(() => {
    if (!reportOwnerName) return []
    return appointments.filter(a => {
      const appDate = new Date(a.date).toISOString().split('T')[0]
      return a.pet.owner.name === reportOwnerName && 
             appDate >= reportStartDate && 
             appDate <= reportEndDate &&
             a.status !== "CANCELED"
    })
  }, [reportOwnerName, reportStartDate, reportEndDate, appointments])

  const reportTotal = reportData.reduce((sum, a) => sum + a.totalCost, 0)

  // Calcular totais gerais
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

  const handleMarkAsPaid = async (paymentMethod: string) => {
    if (!payingAppointment) return
    await markAppointmentAsPaid(payingAppointment.id, tenantId, paymentMethod)
    setPayingAppointment(null)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("pt-BR")
  }

  return (
    <div className="space-y-8">
      
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

      {/* Seção de Relatório para o Cliente */}
      <div className="bg-indigo-900 rounded-2xl shadow-xl overflow-hidden text-white">
        <div className="p-6 border-b border-indigo-800 flex items-center gap-3">
          <FileText size={24} className="text-indigo-300" />
          <h2 className="text-xl font-bold">Relatório de Cobrança por Cliente</h2>
        </div>
        <div className="p-6 bg-indigo-950/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-indigo-300 uppercase mb-2">Selecionar Cliente</label>
              <select 
                value={reportOwnerName}
                onChange={(e) => setReportOwnerName(e.target.value)}
                className="w-full bg-indigo-900 border border-indigo-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Selecione um tutor...</option>
                {owners.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-indigo-300 uppercase mb-2">Data Inicial</label>
              <input 
                type="date" 
                value={reportStartDate}
                onChange={(e) => setReportStartDate(e.target.value)}
                className="w-full bg-indigo-900 border border-indigo-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-indigo-300 uppercase mb-2">Data Final</label>
              <input 
                type="date" 
                value={reportEndDate}
                onChange={(e) => setReportEndDate(e.target.value)}
                className="w-full bg-indigo-900 border border-indigo-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {reportOwnerName ? (
            <div className="bg-white rounded-xl overflow-hidden text-gray-800 shadow-2xl">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">Resumo de Atendimentos</h3>
                  <p className="text-sm text-gray-500">Tutor: {reportOwnerName}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 uppercase font-bold">Total a Cobrar</div>
                  <div className="text-2xl font-black text-indigo-600">R$ {reportTotal.toFixed(2)}</div>
                </div>
              </div>
              
              {reportData.length > 0 ? (
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="px-6 py-3 text-left">Data</th>
                        <th className="px-6 py-3 text-left">Pet / Serviço</th>
                        <th className="px-6 py-3 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reportData.map(a => (
                        <tr key={a.id}>
                          <td className="px-6 py-3 font-medium">{formatDate(a.date)}</td>
                          <td className="px-6 py-3">
                            <span className="font-bold">{a.pet.name}</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span className="text-gray-500">{a.service.name}</span>
                          </td>
                          <td className="px-6 py-3 text-right font-bold">R$ {a.totalCost.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-10 text-center text-gray-400">
                  Nenhum atendimento encontrado para este período.
                </div>
              )}
              
              <div className="p-4 bg-gray-50 flex justify-end">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                >
                  <Download size={16} /> Baixar Relatório (PDF)
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border-2 border-dashed border-indigo-700 rounded-xl text-indigo-300">
              Selecione um cliente acima para gerar o relatório de cobrança.
            </div>
          )}
        </div>
      </div>

      {/* Tabela de Lançamentos Gerais */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Histórico de Lançamentos</h2>
          <div className="flex gap-2">
            <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === "all" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Todos</button>
            <button onClick={() => setFilter("pending")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === "pending" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Pendentes</button>
            <button onClick={() => setFilter("paid")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${filter === "paid" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Pagos</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Cliente/Pet</th>
                  <th className="px-6 py-4">Serviço</th>
                  <th className="px-6 py-4">Combustível</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.filter(a => {
                  if (filter === "pending") return !a.isPaid && a.status !== "CANCELED"
                  if (filter === "paid") return a.isPaid
                  return true
                }).map(appointment => (
                  <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium">{formatDate(appointment.date)}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{appointment.pet.owner.name}</div>
                      <div className="text-xs text-gray-500">{appointment.pet.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{appointment.service.name}</td>
                    <td className="px-6 py-4 text-red-600">R$ {appointment.fuelCost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-900 font-bold">R$ {appointment.totalCost.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {appointment.isPaid ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full">Pago</span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase rounded-full">Pendente</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!appointment.isPaid && appointment.status !== "CANCELED" && (
                        <button onClick={() => setPayingAppointment(appointment)} className="text-indigo-600 font-bold text-xs hover:underline">Marcar Pago</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Pagamento (Mantido do original) */}
      {payingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4 text-center">Confirmar Pagamento</h3>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {["PIX", "CREDITO", "DEBITO", "DINHEIRO"].map(m => (
                <button key={m} onClick={() => handleMarkAsPaid(m)} className="px-4 py-3 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">{m}</button>
              ))}
            </div>
            <button onClick={() => setPayingAppointment(null)} className="w-full py-2 text-gray-500 font-bold text-sm">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}
