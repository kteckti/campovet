"use client"

import { useState, useEffect } from "react"
import { X, DollarSign, CheckCircle, Plus, Trash2 } from "lucide-react"
import { checkoutAppointment } from "@/src/actions/clinica"

interface Service {
  id: string
  name: string
  price: number
}

interface ClinicCheckoutModalProps {
  tenantSlug: string
  isOpen: boolean
  onClose: () => void
  appointment: {
    id: string
    petName: string
    ownerName: string
    vetName: string
  } | null
  services: Service[] // Recebe a lista de serviços
}

export function ClinicCheckoutModal({ tenantSlug, isOpen, onClose, appointment, services }: ClinicCheckoutModalProps) {
  // Estados
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [extraAmount, setExtraAmount] = useState("") // Valor manual (se houver)
  const [paymentType, setPaymentType] = useState("PIX")
  const [installments, setInstallments] = useState("1")

  // === LÓGICA DE RESET ===
  // Sempre que o modal abrir (isOpen muda) ou o agendamento mudar, reseta tudo.
  useEffect(() => {
    if (isOpen) {
      setSelectedServices([])
      setExtraAmount("")
      setPaymentType("PIX")
      setInstallments("1")
    }
  }, [isOpen, appointment])

  if (!isOpen || !appointment) return null

  // Adicionar Serviço na lista
  const handleAddService = (serviceId: string) => {
    if (!serviceId) return
    const serviceToAdd = services.find(s => s.id === serviceId)
    if (serviceToAdd) {
      setSelectedServices(prev => [...prev, serviceToAdd])
    }
  }

  // Remover Serviço
  const handleRemoveService = (index: number) => {
    setSelectedServices(prev => prev.filter((_, i) => i !== index))
  }

  // Calcular Total (Soma dos serviços + Valor extra manual)
  const servicesTotal = selectedServices.reduce((acc, item) => acc + item.price, 0)
  const manualTotal = extraAmount ? parseFloat(extraAmount) : 0
  const finalTotal = servicesTotal + manualTotal

  const actionWithId = checkoutAppointment.bind(null, tenantSlug)

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <DollarSign className="text-green-600" size={20} /> Receber Consulta
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Paciente: {appointment.petName}</p>
          </div>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <form action={async (formData) => {
          await actionWithId(formData)
          onClose()
        }} className="p-6 space-y-4">
          
          <input type="hidden" name="appointmentId" value={appointment.id} />
          
          {/* Input oculto com os IDs dos serviços para salvar no banco */}
          <input type="hidden" name="serviceIds" value={selectedServices.map(s => s.id).join(",")} />

          {/* === SELEÇÃO DE SERVIÇOS === */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Adicionar Procedimento/Serviço</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white mb-2"
              onChange={(e) => {
                handleAddService(e.target.value)
                e.target.value = "" // Reseta o select visualmente
              }}
            >
              <option value="">+ Selecione para adicionar...</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} - R$ {s.price.toFixed(2)}
                </option>
              ))}
            </select>

            {/* Lista de Selecionados */}
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {selectedServices.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100 text-sm">
                  <span>{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">R$ {item.price.toFixed(2)}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveService(index)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 my-2"></div>

          {/* === VALORES === */}
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Valor Extra (R$)</label>
               <input 
                 type="number" 
                 step="0.01" 
                 placeholder="0.00"
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                 value={extraAmount}
                 onChange={(e) => setExtraAmount(e.target.value)}
               />
            </div>
            <div>
               <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Total Final</label>
               <div className="w-full px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-800 font-bold text-right">
                 R$ {finalTotal.toFixed(2)}
               </div>
               {/* Input oculto enviando o valor final calculado para a Action */}
               <input type="hidden" name="amount" value={finalTotal.toFixed(2)} />
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Forma de Pagamento</label>
            <select 
              name="paymentType" 
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="PIX">Pix</option>
              <option value="DEBIT">Cartão de Débito</option>
              <option value="CREDIT">Cartão de Crédito</option>
              <option value="MONEY">Dinheiro</option>
            </select>
          </div>

          {paymentType === "CREDIT" && (
            <div className="animate-in slide-in-from-top-1">
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Parcelas</label>
              <select name="installments" value={installments} onChange={(e) => setInstallments(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                <option value="1">À vista (1x)</option>
                <option value="2">2x</option>
                <option value="3">3x</option>
                <option value="4">4x</option>
                <option value="5">5x</option>
                <option value="6">6x</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-50 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
              <CheckCircle size={16} /> Confirmar Pagamento
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}