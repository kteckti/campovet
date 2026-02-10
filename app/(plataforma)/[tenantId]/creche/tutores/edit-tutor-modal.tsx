"use client"

import { useState } from "react"
import { X, Save, Pencil, User, Phone, Mail, MapPin, FileText } from "lucide-react"
import { updateCustomer } from "@/src/actions/creche"

interface EditTutorModalProps {
  customer: {
    id: string
    name: string
    phone: string | null
    email: string | null
    address: string | null
    cpf: string | null
  }
  tenantId: string
}

export function EditTutorModal({ customer, tenantId }: EditTutorModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Prepara a action com os IDs já fixados
  const updateAction = updateCustomer.bind(null, customer.id, tenantId)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      await updateAction(formData)
      setIsOpen(false) // Fecha após salvar
    } catch (error) {
      alert("Erro ao atualizar.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Botão Gatilho (Substitui o botão estático antigo) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1 hover:underline"
      >
        <Pencil size={12} />
        Editar
      </button>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                Editar Tutor: {customer.name}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Formulário */}
            <form action={handleSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nome Completo</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-2.5 text-gray-400" />
                  <input 
                    name="name" 
                    defaultValue={customer.name}
                    required 
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">CPF</label>
                  <div className="relative">
                    <FileText size={16} className="absolute left-3 top-2.5 text-gray-400" />
                    <input 
                      name="cpf" 
                      defaultValue={customer.cpf || ""}
                      placeholder="000.000.000-00"
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                </div>
                <div>
                   <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Telefone</label>
                   <div className="relative">
                    <Phone size={16} className="absolute left-3 top-2.5 text-gray-400" />
                    <input 
                      name="phone" 
                      defaultValue={customer.phone || ""}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-2.5 text-gray-400" />
                  <input 
                    name="email" 
                    type="email"
                    defaultValue={customer.email || ""}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Endereço</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-2.5 text-gray-400" />
                  <textarea 
                    name="address" 
                    rows={2}
                    defaultValue={customer.address || ""}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                  />
                </div>
              </div>

              {/* Rodapé Botões */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <Save size={16} />
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  )
}