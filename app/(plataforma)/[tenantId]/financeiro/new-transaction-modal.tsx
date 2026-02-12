"use client"

import { useState } from "react"
import { Plus, X, ArrowUpCircle, ArrowDownCircle, Save } from "lucide-react"
import { createTransaction } from "@/src/actions/finance"

export function NewTransactionModal({ tenantSlug }: { tenantSlug: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState("EXPENSE") // Padrão Despesa, pois Receita já vem auto da creche

  const actionWithId = createTransaction.bind(null, tenantSlug)

  return (
    <>
      {/* BOTÃO QUE ABRE O MODAL */}
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
      >
        <Plus size={18} /> Nova Transação
      </button>

      {/* O MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">Lançamento Manual</h3>
              <button onClick={() => setIsOpen(false)}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
            </div>

            <form action={async (formData) => {
              await actionWithId(formData)
              setIsOpen(false) // Fecha após salvar
            }} className="p-6 space-y-4">

              {/* TIPO: RECEITA OU DESPESA */}
              <div className="grid grid-cols-2 gap-4">
                <label className={`border rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer transition-all ${type === 'INCOME' ? 'bg-green-50 border-green-500 text-green-700 font-bold' : 'hover:bg-gray-50'}`}>
                  <input type="radio" name="type" value="INCOME" className="hidden" onChange={() => setType('INCOME')} />
                  <ArrowUpCircle size={20} /> Receita
                </label>
                <label className={`border rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer transition-all ${type === 'EXPENSE' ? 'bg-red-50 border-red-500 text-red-700 font-bold' : 'hover:bg-gray-50'}`}>
                  <input type="radio" name="type" value="EXPENSE" defaultChecked className="hidden" onChange={() => setType('EXPENSE')} />
                  <ArrowDownCircle size={20} /> Despesa
                </label>
              </div>

              {/* DESCRIÇÃO E VALOR */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Descrição</label>
                <input name="description" required placeholder={type === 'EXPENSE' ? "Ex: Conta de Luz, Compra de Ração..." : "Ex: Venda de Balcão, Petiscos..."} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Valor (R$)</label>
                  <input name="amount" type="number" step="0.01" required placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Data</label>
                  <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>

              {/* CATEGORIA E MÉTODO */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Categoria / Módulo</label>
                  <select name="module" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                    <option value="GERAL">Geral / Administrativo</option>
                    <option value="CRECHE">Creche</option>
                    <option value="CLINICA">Clínica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Meio de Pagamento</label>
                  <select name="method" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                    <option value="PIX">Pix</option>
                    <option value="DINHEIRO">Dinheiro</option>
                    <option value="DEBITO">Débito</option>
                    <option value="CREDITO">Crédito</option>
                    <option value="BOLETO">Boleto</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
              </div>

              {/* RODAPÉ */}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-gray-900 hover:bg-black text-white rounded-lg text-sm font-medium flex items-center gap-2">
                  <Save size={16} /> Salvar Lançamento
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  )
}