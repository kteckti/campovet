"use client"

import { useState } from "react"
import Link from "next/link"
import { LogIn, LogOut, Dog, X, CheckCircle, Settings, Save, FileText, Users, Trash2, CreditCard, Search, Loader2 } from "lucide-react"
import { checkInPet, updateKennel, checkOutPet, deleteKennel, searchPets } from "@/src/actions/creche" 

interface Pet {
  id: string
  name: string
  owner: { name: string }
}

interface KennelCardProps {
  kennel: any 
  pets: Pet[] // Estes serão os 5 recentes vindos da página
  tenantSlug: string
}

export function KennelCard({ kennel, pets: initialRecentPets, tenantSlug }: KennelCardProps) {
  // Estados dos Modais
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  
  // Estados de Checkout
  const [checkoutData, setCheckoutData] = useState<{ bookingId: string, petName: string } | null>(null)
  const [paymentType, setPaymentType] = useState("PIX")

  // === NOVOS ESTADOS PARA BUSCA DE PET ===
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResult, setSearchResult] = useState<Pet[]>(initialRecentPets)
  const [isSearching, setIsSearching] = useState(false)

  // Dados da Baia
  const activeBookings = kennel.bookings?.filter((b: any) => b.status === "ACTIVE") || []
  const ocupacao = activeBookings.length
  const capacidade = kennel.capacity || 1
  const isFull = ocupacao >= capacidade
  const isPartial = ocupacao > 0 && !isFull

  // Actions
  const checkInAction = checkInPet.bind(null, tenantSlug)
  const updateAction = updateKennel.bind(null, kennel.id, tenantSlug)
  const checkOutAction = checkOutPet.bind(null, tenantSlug)

  // === FUNÇÃO DE BUSCA ===
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)

    if (term.length === 0) {
      setSearchResult(initialRecentPets) // Volta para os recentes se limpar
      return
    }

    setIsSearching(true)
    try {
      // Chama a Server Action de busca
      const results = await searchPets(term, tenantSlug)
      setSearchResult(results)
    } catch (error) {
      console.error("Erro na busca", error)
    } finally {
      setIsSearching(false)
    }
  }

  // Limpa estados ao fechar modal
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedPet(null)
    setSearchTerm("")
    setSearchResult(initialRecentPets)
  }

  const handleDelete = async () => {
    if (confirm(`Tem certeza que deseja excluir a baia "${kennel.name}"?`)) {
      try {
        await deleteKennel(kennel.id, tenantSlug)
        setIsEditModalOpen(false)
      } catch (error: any) {
        alert(error.message || "Erro ao excluir baia.")
      }
    }
  }

  const openCheckout = (bookingId: string, petName: string) => {
    setCheckoutData({ bookingId, petName })
    setPaymentType("PIX")
    setIsCheckoutModalOpen(true)
  }

  return (
    <>
      <div className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between h-full ${
        isFull ? 'border-red-200 bg-red-50/20' : 
        isPartial ? 'border-yellow-200 bg-yellow-50/20' : 'border-gray-200'
      }`}>
        
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          isFull ? 'bg-red-500' : isPartial ? 'bg-yellow-500' : 'bg-green-500'
        }`} />

        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="absolute top-3 right-3 text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-gray-100 z-10"
        >
          <Settings size={16} />
        </button>

        <div className="pl-3 mb-3 pr-6">
          <div className="flex justify-between items-start flex-col">
            <h3 className="font-bold text-lg text-gray-800 leading-tight mb-1">{kennel.name}</h3>
            
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

        <div className="pl-3 mt-auto space-y-2">
          {ocupacao > 0 && (
            <div className="space-y-2 mb-3">
              {activeBookings.map((booking: any) => (
                <div key={booking.id} className="bg-white p-2 rounded border border-gray-200 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="bg-orange-100 p-1.5 rounded-full text-orange-600 shrink-0">
                      <Dog size={14} />
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-xs text-gray-800 truncate">{booking.pet.name}</p>
                      <Link 
                        href={`/${tenantSlug}/creche/pets/${booking.pet.id}`}
                        className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5"
                      >
                        <FileText size={10} /> Ficha
                      </Link>
                    </div>
                  </div>
                  <button
                    onClick={() => openCheckout(booking.id, booking.pet.name)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                    title="Realizar Checkout"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

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

      {/* === MODAL 1: CHECK-IN COM BUSCA === */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800">Novo Check-in: {kennel.name}</h3>
              <button onClick={closeModal}><X size={20} className="text-gray-400" /></button>
            </div>

            <form action={async (formData) => {
              await checkInAction(formData)
              closeModal()
            }} className="p-6 space-y-4">
              
              <input type="hidden" name="kennelId" value={kennel.id} />
              {/* O ID do Pet selecionado vai escondido aqui */}
              <input type="hidden" name="petId" value={selectedPet?.id || ""} />

              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-xs text-yellow-800 mb-2">
                <span className="font-bold">Nota:</span> Esta baia possui {ocupacao} animal(is). 
                Restam {capacidade - ocupacao} vaga(s).
              </div>

              {/* SELEÇÃO DE PET (BUSCA) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o Pet</label>
                
                {selectedPet ? (
                  // ESTADO: Pet Selecionado
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-200 p-2 rounded-full text-blue-700">
                        <Dog size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{selectedPet.name}</p>
                        <p className="text-xs text-gray-500">Tutor: {selectedPet.owner.name}</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setSelectedPet(null)}
                      className="text-red-500 hover:bg-red-100 p-1.5 rounded-full transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  // ESTADO: Buscando Pet
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Buscar por nome do pet..." 
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        autoFocus
                      />
                      {isSearching && (
                        <div className="absolute right-3 top-2.5">
                          <Loader2 className="animate-spin text-gray-400" size={18} />
                        </div>
                      )}
                    </div>

                    {/* Lista de Resultados */}
                    <div className="mt-2 max-h-48 overflow-y-auto border border-gray-100 rounded-lg bg-white shadow-sm divide-y divide-gray-50">
                      {searchResult.length === 0 ? (
                        <div className="p-3 text-center text-xs text-gray-400">
                          Nenhum pet encontrado.
                        </div>
                      ) : (
                        <>
                          <div className="px-3 py-1.5 bg-gray-50 text-[10px] font-bold uppercase text-gray-400">
                            {searchTerm ? "Resultados da busca" : "Adicionados Recentemente"}
                          </div>
                          {searchResult.map(pet => (
                            <button
                              key={pet.id}
                              type="button"
                              onClick={() => setSelectedPet(pet)}
                              className="w-full text-left p-3 hover:bg-green-50 transition-colors flex justify-between items-center group"
                            >
                              <div>
                                <p className="font-medium text-sm text-gray-800 group-hover:text-green-800">{pet.name}</p>
                                <p className="text-xs text-gray-500">Tutor: {pet.owner.name}</p>
                              </div>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded group-hover:bg-green-200 group-hover:text-green-800">
                                Selecionar
                              </span>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={!selectedPet}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <CheckCircle size={16} /> Confirmar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL 2: CHECKOUT (MANTIDO IGUAL) === */}
      {isCheckoutModalOpen && checkoutData && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  <CreditCard size={20} className="text-blue-600" />
                  Pagamento & Saída
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Pet: {checkoutData.petName}</p>
              </div>
              <button onClick={() => setIsCheckoutModalOpen(false)}><X size={20} className="text-gray-400" /></button>
            </div>

            <form action={checkOutAction} className="p-6 space-y-5">
              <input type="hidden" name="bookingId" value={checkoutData.bookingId} />
              <input type="hidden" name="kennelId" value={kennel.id} />

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Forma de Pagamento</label>
                <select 
                  name="paymentType" 
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PIX">Pix</option>
                  <option value="DEBIT">Cartão de Débito</option>
                  <option value="CREDIT">Cartão de Crédito</option>
                  <option value="MONEY">Dinheiro</option>
                </select>
              </div>

              {paymentType === "CREDIT" && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Parcelamento</label>
                  <select name="installments" className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="1">À vista (1x)</option>
                    <option value="2">2x Sem Juros</option>
                    <option value="3">3x Sem Juros</option>
                    <option value="4">4x Sem Juros</option>
                    <option value="5">5x Sem Juros</option>
                    <option value="6">6x Sem Juros</option>
                  </select>
                </div>
              )}

              <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 border border-blue-100">
                Ao confirmar, o sistema calculará o valor final (diárias + serviços), registrará no caixa e liberará o relatório.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsCheckoutModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm font-medium">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                  <LogOut size={16} /> Confirmar Saída
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL 3: EDIÇÃO (MANTIDO IGUAL) === */}
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

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Capacidade</label>
                <input name="capacity" type="number" min="1" defaultValue={kennel.capacity || 1} required className="w-full px-3 py-2 border rounded-lg text-sm" />
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

              <div className="flex justify-between items-center pt-4 border-t border-gray-50 mt-4">
                <button type="button" onClick={handleDelete} className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition-colors">
                  <Trash2 size={16} /> Excluir
                </button>
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