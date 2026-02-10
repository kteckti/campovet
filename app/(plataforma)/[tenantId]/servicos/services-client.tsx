"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, X, Scissors, Save, AlertCircle } from "lucide-react"
import { createService, updateService, deleteService } from "@/src/actions/creche"

interface Service {
  id: string
  name: string
  price: number
}

interface ServicesClientProps {
  initialServices: Service[]
  tenantId: string
}

export function ServicesClient({ initialServices, tenantId }: ServicesClientProps) {
  // Estados para controlar qual Modal está aberto
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deletingService, setDeletingService] = useState<Service | null>(null)

  // Binds das Actions
  const createAction = createService.bind(null, tenantId)
  
  // Função auxiliar para Delete
  const handleDelete = async () => {
    if (!deletingService) return
    await deleteService(deletingService.id, tenantId)
    setDeletingService(null)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      
      {/* Header da Tabela */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div>
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Scissors size={20} className="text-blue-600" />
            Catálogo de Serviços
          </h2>
          <p className="text-sm text-gray-500">Gerencie os preços e tipos de serviços extras.</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors"
        >
          <Plus size={18} /> Novo Serviço
        </button>
      </div>

      {/* Lista de Serviços */}
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="bg-white text-gray-500 font-semibold uppercase text-xs border-b border-gray-100">
          <tr>
            <th className="px-6 py-4">Nome do Serviço</th>
            <th className="px-6 py-4">Valor (R$)</th>
            <th className="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {initialServices.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-6 py-8 text-center text-gray-400 italic">
                Nenhum serviço cadastrado ainda.
              </td>
            </tr>
          ) : (
            initialServices.map((service) => (
              <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{service.name}</td>
                <td className="px-6 py-4 text-gray-900 font-bold">R$ {service.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button 
                    onClick={() => setEditingService(service)}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => setDeletingService(service)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* === MODAL DE CRIAÇÃO === */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800">Novo Serviço</h3>
              <button onClick={() => setIsCreateOpen(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form action={async (formData) => {
              await createAction(formData)
              setIsCreateOpen(false)
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nome</label>
                <input name="name" required placeholder="Ex: Banho Terapêutico" className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Preço (R$)</label>
                <input name="price" type="number" step="0.01" required placeholder="0.00" className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL DE EDIÇÃO === */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800">Editar Serviço</h3>
              <button onClick={() => setEditingService(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form action={async (formData) => {
              await updateService(editingService.id, tenantId, formData)
              setEditingService(null)
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nome</label>
                <input name="name" defaultValue={editingService.name} required className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Preço (R$)</label>
                <input name="price" type="number" step="0.01" defaultValue={editingService.price} required className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingService(null)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL DE EXCLUSÃO === */}
      {deletingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={24} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Excluir Serviço?</h3>
              <p className="text-gray-500 text-sm mb-6">
                Você tem certeza que deseja remover <strong>{deletingService.name}</strong>? Essa ação não pode ser desfeita.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setDeletingService(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}