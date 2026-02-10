"use client" // <--- Importante: Torna este componente interativo

import { useState } from "react"
import { Save, PlusCircle, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { createPet, createCustomerQuick } from "@/src/actions/creche"

// Tipagem dos dados que vêm do banco
interface PetFormProps {
  tenantId: string
  initialOwners: { id: string; name: string; phone: string | null }[]
}

export function PetForm({ tenantId, initialOwners }: PetFormProps) {
  const [owners, setOwners] = useState(initialOwners) // Lista de donos
  const [isModalOpen, setIsModalOpen] = useState(false) // Controle da janela
  const [selectedOwner, setSelectedOwner] = useState("") // Dono selecionado
  const [isSavingTutor, setIsSavingTutor] = useState(false) // Loading do botão

  // Server Action do Pet (com bind)
  const createPetWithId = createPet.bind(null, tenantId)

  // Função para salvar o Tutor via Modal sem recarregar a página
  async function handleQuickSaveTutor(formData: FormData) {
    setIsSavingTutor(true)
    try {
      // 1. Chama o Server Action
      const newTutor = await createCustomerQuick(tenantId, formData)
      
      // 2. Adiciona na lista localmente
      setOwners([...owners, newTutor])
      
      // 3. Seleciona ele automaticamente
      setSelectedOwner(newTutor.id)
      
      // 4. Fecha o modal
      setIsModalOpen(false)
    } catch (error) {
      alert("Erro ao salvar tutor. Verifique os dados.")
    } finally {
      setIsSavingTutor(false)
    }
  }

  return (
    <>
      {/* === FORMULÁRIO PRINCIPAL (PET) === */}
      <form action={createPetWithId} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="space-y-4">
          
          {/* Select Inteligente */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Tutor (Dono) *</label>
              
              {/* Botão que abre o Modal */}
              <button 
                type="button" // Importante ser type="button" para não submeter o form principal
                onClick={() => setIsModalOpen(true)}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium"
              >
                <PlusCircle size={14} />
                Cadastrar Novo Tutor
              </button>
            </div>

            <select 
              name="ownerId" 
              required
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Selecione um tutor...</option>
              {owners.map(owner => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} {owner.phone ? `(${owner.phone})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Resto dos campos do Pet... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Pet *</label>
              <input name="name" required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Espécie *</label>
              <select name="species" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="Cão">Cão</option>
                <option value="Gato">Gato</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raça</label>
              <input name="breed" type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso</label>
              <input name="weight" type="number" step="0.1" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nascimento</label>
              <input name="birthDate" type="date" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
          <Link href={`/${tenantId}/creche/pets`} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Cancelar</Link>
          <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
            <Save size={18} /> Salvar Pet
          </button>
        </div>
      </form>

      {/* === MODAL / JANELA FLUTUANTE === */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header do Modal */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800">Novo Tutor Rápido</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Form do Modal */}
            <form action={handleQuickSaveTutor} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input name="name" autoFocus required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input name="phone" type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input 
                  name="cpf" 
                  type="text" 
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input name="address" type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSavingTutor}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  {isSavingTutor ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Salvar
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  )
}