"use client"

import { useState } from "react"
import { Plus, X, Save, Box } from "lucide-react"
import { createKennel } from "@/src/actions/creche"

interface KennelModalProps {
  tenantId: string
}

export function KennelModal({ tenantId }: KennelModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Prepara a action
  const createWithId = createKennel.bind(null, tenantId)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      await createWithId(formData)
      setIsOpen(false) // Fecha modal após sucesso
    } catch (error) {
      alert("Erro ao criar baia")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
      >
        <Plus size={18} />
        Nova Baia
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Box size={18} className="text-blue-600" />
                Nova Acomodação
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form action={handleSubmit} className="p-6 space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome / Identificação *</label>
                <input
                  name="name"
                  autoFocus
                  required
                  type="text"
                  placeholder="Ex: Canil 01, Gatil Premium..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho / Porte</label>
                <select name="size" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="Pequeno">Pequeno (P)</option>
                  <option value="Médio">Médio (M)</option>
                  <option value="Grande">Grande (G)</option>
                  <option value="Gigante">Gigante (GG)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Diária (R$)</label>
                <input
                  name="dailyRate"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
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
                  {isLoading ? "Salvando..." : "Salvar Baia"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  )
}