"use client"

import { useState } from "react"
import Link from "next/link"
import { LogIn, LogOut, Dog, X, CheckCircle, Settings, Save, FileText, Users, Trash2 } from "lucide-react"
// ADICIONADO o deleteKennel na importação abaixo
import { checkInPet, updateKennel, checkOutPet, deleteKennel } from "@/src/actions/creche" 

interface Pet {
  id: string
  name: string
  owner: { name: string }
}

interface KennelCardProps {
  kennel: any 
  pets: Pet[] 
  tenantSlug: string
}

export function KennelCard({ kennel, pets, tenantSlug }: KennelCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  // Filtrar bookings ativos
  const activeBookings = kennel.bookings?.filter((b: any) => b.status === "ACTIVE") || []
  const ocupacao = activeBookings.length
  const capacidade = kennel.capacity || 1
  
  // Estados da Baia
  const isFull = ocupacao >= capacidade
  const isEmpty = ocupacao === 0
  const isPartial = ocupacao > 0 && !isFull

  const checkInAction = checkInPet.bind(null, tenantSlug)
  const updateAction = updateKennel.bind(null, kennel.id, tenantSlug)

  // === Função para Excluir a Baia ===
  const handleDelete = async () => {
    if (confirm(`Tem certeza que deseja excluir a baia "${kennel.name}"?`)) {
      try {
        await deleteKennel(kennel.id, tenantSlug)
        setIsEditModalOpen(false) // Fecha o modal se excluir com sucesso
      } catch (error: any) {
        alert(error.message || "Erro ao excluir baia.")
      }
    }
  }

  return (
    <>
      <div className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between h-full ${
        isFull ? 'border-red-200 bg-red-50/20' : 
        isPartial ? 'border-yellow-200 bg-yellow-50/20' : 'border-gray-200'
      }`}>
        
        {/* Barra lateral de Status */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          isFull ? 'bg-red-500' : 
          isPartial ? 'bg-yellow-500' : 'bg-green-500'
        }`} />

        {/* Botão Config */}
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-gray-100 z-10"
        >
          <Settings size={16} />
        </button>

        {/* Cabeçalho do Card */}
        <div className="pl-3 mb-3 pr-6">
          <div className="flex justify-between items-start flex-col">
            <h3 className="font-bold text-lg text-gray-800 leading-tight mb-1">{kennel.name}</h3>
            
            {/* Badge de Ocupação */}
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                 isFull ? 'bg-red-100 text-red-700 border-red-200' : 
                 isPartial ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-green-100 text-green-700 border-green-200'
              }`}>
                {isFull ? 'Lotada' : isPartial ? 'Parcial' : 'Livre'}
              </span>
              <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                <Users size={12} /> {ocupacao}/{capacidade}
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 flex gap-2">
            <span>Tam: <b>{kennel.size || "P"}</b></span>
            <span>R$ <b>{kennel.dailyRate?.toFixed(2)}</b></span>
          </div>
        </div>

        {/* LISTA DE PETS (Área de Ação) */}
        <div className="pl-3 mt-auto space-y-2">
          
          {/* Se tiver pets, lista eles */}
          {ocupacao > 0 && (
            <div className="space-y-2 mb-3">
              {activeBookings.map((booking: any) => (
                <div key={booking.id} className="bg-white p-2 rounded border border-gray-200 flex items-center justify-between shadow-sm">
                  
                  {/* Info do Pet */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="bg-orange-100 p-1.5 rounded-full text-orange-600 shrink-0">
                      <Dog size={14} />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-xs text-gray-800 truncate">{booking.pet.name}</p>
                      
                      {/* Link Ficha */}
                      <Link 
                        href={`/${tenantSlug}/creche/pets/${booking.pet.id}`}
                        className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5"
                      >
                        <FileText size={10} /> Ficha
                      </Link>
                    </div>
                  </div>

                  {/* Botão Checkout Individual */}
                  <form action={async () => {
                    await checkOutPet(booking.id, kennel.id, tenantSlug)
                  }}>
                    <button
                      type="submit"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                      title="Realizar Checkout"
                    >
                      <LogOut size={14} />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}

          {/* Botão Check-in (Aparece se tiver vaga) */}
          {!isFull ? (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-green-100 hover:bg-green-200 text-green-700 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-green-200"
            >
              <LogIn size={14} />
              + Adicionar Pet
            </button>
          ) : (
            <div className="text-center text-xs text-red-400 font-medium py-1">
              Capacidade Máxima Atingida
            </div>
          )}
        </div>
      </div>

      {/* === MODAL DE CHECK-IN === */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800">Novo Check-in: {kennel.name}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-400" /></button>
            </div>

            <form action={async (formData) => {
              await checkInAction(formData)
              setIsModalOpen(false)
            }} className="p-6 space-y-4">
              
              <input type="hidden" name="kennelId" value={kennel.id} />

              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-xs text-yellow-800 mb-2">
                <span className="font-bold">Nota:</span> Esta baia possui {ocupacao} animal(is). 
                Restam {capacidade - ocupacao} vaga(s).
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o Pet</label>
                <select 
                  name="petId" 
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="">-- Escolha da lista --</option>
                  {pets.map(pet => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} (Tutor: {pet.owner.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                  <CheckCircle size={16} /> Confirmar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL DE EDIÇÃO === */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Settings size={18} className="text-blue-600" />
                Editar Baia
              </h3>
              <button onClick={() => setIsEditModalOpen(false)}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
            </div>

            <form action={async (formData) => {
               await updateAction(formData)
               setIsEditModalOpen(false)
            }} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nome</label>
                <input name="name" defaultValue={kennel.name} required className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>

              {/* CAMPO: CAPACIDADE */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Capacidade (Qtd. Animais)</label>
                <input 
                  name="capacity" 
                  type="number" 
                  min="1" 
                  defaultValue={kennel.capacity || 1} 
                  required 
                  className="w-full px-3 py-2 border rounded-lg text-sm" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Tamanho</label>
                  <select name="size" defaultValue={kennel.size || "Médio"} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="Pequeno">Pequeno (P)</option>
                    <option value="Médio">Médio (M)</option>
                    <option value="Grande">Grande (G)</option>
                    <option value="Gigante">Gigante (GG)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Diária (R$)</label>
                  <input name="dailyRate" type="number" step="0.01" defaultValue={kennel.dailyRate} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>

              {/* RODAPÉ DO MODAL DE EDIÇÃO (Com botão de Excluir) */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-50 mt-4">
                
                {/* Botão de Excluir à esquerda */}
                <button 
                  type="button" 
                  onClick={handleDelete}
                  className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={16} /> Excluir
                </button>

                {/* Botões de Salvar/Cancelar à direita */}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                    <Save size={16} /> Salvar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}