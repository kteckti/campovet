"use client"

import { useState } from "react"
import { Plus, X, Package, DollarSign, Calendar } from "lucide-react"
import { createProduct } from "@/src/actions/estoque"

export function ProductModal({ tenantSlug }: { tenantSlug: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        // CORRIGIDO: Agora usa o padrão BLUE
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
      >
        <Plus size={18} /> Novo Item
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Package className="text-blue-600" size={20} /> Cadastrar Medicamento/Insumo
              </h3>
              <button onClick={() => setIsOpen(false)}><X size={20} className="text-gray-400" /></button>
            </div>

            <form action={async (formData) => {
              await createProduct(tenantSlug, formData)
              setIsOpen(false)
            }} className="p-6 space-y-4">

              {/* Nome e Unidade */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nome do Produto</label>
                  <input name="name" required placeholder="Ex: Dipirona Gotas 500mg" className="w-full px-3 py-2 border rounded-lg text-sm outline-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Unidade</label>
                  <select name="unit" className="w-full px-3 py-2 border rounded-lg text-sm bg-white outline-blue-500">
                    <option value="UN">Unidade (UN)</option>
                    <option value="ML">Mililitro (ML)</option>
                    <option value="FR">Frasco</option>
                    <option value="CX">Caixa</option>
                    <option value="AMP">Ampola</option>
                    <option value="COMP">Comprimido</option>
                  </select>
                </div>
              </div>

              {/* Quantidades */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Estoque Atual</label>
                  <input name="quantity" type="number" required placeholder="0" className="w-full px-3 py-2 border rounded-lg text-sm outline-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Estoque Mínimo (Alerta)</label>
                  <input name="minStock" type="number" defaultValue="5" className="w-full px-3 py-2 border rounded-lg text-sm outline-blue-500" />
                </div>
              </div>

              {/* Preços */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Preço de Custo (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-400 text-xs">R$</span>
                    <input name="costPrice" step="0.01" placeholder="0.00" className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm outline-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-blue-600 mb-1">Preço de Venda (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-400 text-xs">R$</span>
                    <input name="price" step="0.01" required placeholder="0.00" className="w-full pl-8 pr-3 py-2 border border-blue-200 rounded-lg text-sm outline-blue-500 font-bold text-gray-800" />
                  </div>
                </div>
              </div>

              {/* Validade */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Data de Validade</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input name="expiryDate" type="date" className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm outline-blue-500 text-gray-600" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-50 mt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                  <Package size={16} /> Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}