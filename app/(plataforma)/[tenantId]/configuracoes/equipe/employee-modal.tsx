"use client"

import { useState } from "react"
import { UserPlus, X, Save, ShieldCheck } from "lucide-react"
import { createEmployee } from "@/src/actions/users"

export function EmployeeModal({ tenantSlug }: { tenantSlug: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
      >
        <UserPlus size={18} /> Novo Funcionário
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Cadastrar Colaborador</h3>
              <button onClick={() => setIsOpen(false)}><X size={20} className="text-gray-400" /></button>
            </div>

            <form action={async (formData) => {
              await createEmployee(tenantSlug, formData)
              setIsOpen(false)
            }} className="p-6 space-y-4">

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nome Completo</label>
                <input name="name" required placeholder="Ex: João Silva" className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">E-mail de Acesso</label>
                <input name="email" type="email" required placeholder="joao@clinica.com" className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <label className="block text-xs font-bold uppercase text-blue-800 mb-2 flex items-center gap-2">
                  <ShieldCheck size={14} /> Permissão / Cargo
                </label>
                <select name="role" className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="RECEPCAO">Recepção (Agendar, Check-in)</option>
                  <option value="FUNCIONARIO">Funcionario (Prontuário, Agenda)</option>
                  <option value="FINANCEIRO">Financeiro (Caixa, Relatórios)</option>
                  <option value="GERENTE">Gerente (Acesso Total)</option>
                </select>
                <p className="text-[10px] text-blue-600 mt-2">
                  O nível de acesso define quais telas o usuário pode ver.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg text-sm">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                  <Save size={16} /> Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}