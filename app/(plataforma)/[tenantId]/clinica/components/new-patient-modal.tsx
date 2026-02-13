"use client"

import { useState } from "react"
import { Plus, X, User, Phone, PawPrint, Save, CheckCircle } from "lucide-react"
import { registerPatientAndTutor } from "@/src/actions/pacientes"

export function NewPatientModal({ tenantSlug }: { tenantSlug: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleClose = () => {
    setIsOpen(false)
    setIsSuccess(false) // Reseta estado
  }

  return (
    <>
      {/* Botão para abrir o modal */}
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
      >
        <Plus size={20} /> Novo Paciente
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Cabeçalho */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <PawPrint className="text-blue-600" size={20} /> Cadastro de Paciente
              </h3>
              <button onClick={handleClose}><X size={20} className="text-gray-400" /></button>
            </div>

            {isSuccess ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Cadastro Realizado!</h3>
                <p className="text-gray-500 mb-6">O tutor e o pet foram registrados com sucesso.</p>
                <button onClick={handleClose} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium">
                  Fechar
                </button>
              </div>
            ) : (
              <form action={async (formData) => {
                await registerPatientAndTutor(tenantSlug, formData)
                setIsSuccess(true)
              }} className="p-6 space-y-6">

                {/* Seção TUTOR */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase text-blue-600 border-b border-blue-100 pb-1 flex items-center gap-2">
                    <User size={16} /> Dados do Tutor
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Nome Completo *</label>
                      <input name="tutorName" required placeholder="Ex: Ana Maria Silva" className="w-full px-3 py-2 border rounded-lg text-sm outline-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Telefone / WhatsApp *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input name="phone" required placeholder="(00) 90000-0000" className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-blue-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">CPF (Opcional)</label>
                      <input name="cpf" placeholder="000.000.000-00" className="w-full px-3 py-2 border rounded-lg text-sm outline-blue-500" />
                    </div>
                  </div>
                </div>

                {/* Seção PET */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase text-blue-600 border-b border-blue-100 pb-1 flex items-center gap-2">
                    <PawPrint size={16} /> Dados do Pet
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Nome do Pet *</label>
                      <input name="petName" required placeholder="Ex: Thor" className="w-full px-3 py-2 border rounded-lg text-sm outline-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Data de Nasc.</label>
                      <input name="birthDate" type="date" className="w-full px-3 py-2 border rounded-lg text-sm outline-blue-500 text-gray-600" />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Espécie *</label>
                      <select name="species" className="w-full px-3 py-2 border rounded-lg text-sm bg-white outline-blue-500">
                        <option value="Cachorro">Cachorro</option>
                        <option value="Gato">Gato</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Raça</label>
                      <input name="breed" placeholder="Ex: Golden" className="w-full px-3 py-2 border rounded-lg text-sm outline-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Gênero</label>
                      <select name="gender" className="w-full px-3 py-2 border rounded-lg text-sm bg-white outline-blue-500">
                        <option value="Macho">Macho</option>
                        <option value="Femea">Fêmea</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-50 mt-2">
                  <button type="button" onClick={handleClose} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm">Cancelar</button>
                  <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                    <Save size={16} /> Salvar Cadastro
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}