"use client"

import { useState } from "react"
import { CalendarPlus, X, Search, CheckCircle } from "lucide-react"
import { createAppointment } from "@/src/actions/clinica"
import { searchPets } from "@/src/actions/creche" // Reusando a busca de pets que já criamos!

export function AppointmentModal({ tenantSlug, veterinarians }: { tenantSlug: string, veterinarians: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Estados para busca de Pet
  const [petSearch, setPetSearch] = useState("")
  const [petsFound, setPetsFound] = useState<any[]>([])
  const [selectedPet, setSelectedPet] = useState<any>(null)

  const handleSearchPet = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setPetSearch(term)
    if (term.length > 2) {
      const results = await searchPets(term, tenantSlug)
      setPetsFound(results)
    } else {
      setPetsFound([])
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
      >
        <CalendarPlus size={18} /> Novo Agendamento
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Agendar Consulta</h3>
              <button onClick={() => setIsOpen(false)}><X size={20} className="text-gray-400" /></button>
            </div>

            <form action={async (formData) => {
              await createAppointment(tenantSlug, formData)
              setIsOpen(false)
              setSelectedPet(null)
              setPetSearch("")
            }} className="p-6 space-y-4">

              {/* Busca de Pet */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Paciente (Pet)</label>
                <input type="hidden" name="petId" value={selectedPet?.id || ""} />
                
                {!selectedPet ? (
                  <div className="relative">
                    <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 ring-blue-500">
                      <div className="pl-3 text-gray-400"><Search size={18} /></div>
                      <input 
                        type="text" 
                        placeholder="Buscar pet..." 
                        className="w-full px-3 py-2 outline-none text-sm"
                        value={petSearch}
                        onChange={handleSearchPet}
                        autoFocus
                      />
                    </div>
                    {petsFound.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border mt-1 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                        {petsFound.map(pet => (
                          <div 
                            key={pet.id} 
                            onClick={() => { setSelectedPet(pet); setPetsFound([]) }}
                            className="p-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0"
                          >
                            <span className="font-bold">{pet.name}</span> <span className="text-gray-500">({pet.owner.name})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-between items-center bg-blue-50 p-2 rounded-lg border border-blue-100">
                    <span className="text-sm font-medium text-blue-800">{selectedPet.name}</span>
                    <button type="button" onClick={() => setSelectedPet(null)} className="text-gray-400 hover:text-red-500"><X size={16}/></button>
                  </div>
                )}
              </div>

              {/* Data e Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Data</label>
                  <input name="date" type="date" required className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Hora</label>
                  <input name="time" type="time" required className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>

              {/* Veterinário */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Veterinário</label>
                <select name="vetId" required className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  <option value="">Selecione...</option>
                  {veterinarians.map(vet => (
                    <option key={vet.id} value={vet.id}>{vet.name}</option>
                  ))}
                </select>
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Motivo</label>
                <input name="reason" placeholder="Ex: Vacina V10" required className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Observações</label>
                <textarea name="notes" rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                  <CheckCircle size={16} /> Agendar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  )
}