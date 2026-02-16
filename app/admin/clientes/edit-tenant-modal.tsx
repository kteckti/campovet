"use client"

import { useState } from "react"
import { updateTenant } from "@/src/lib/actions/admin-actions"
import { X, Loader2, Save, Building2, Globe, FileText, Shield, Activity } from "lucide-react"

interface EditTenantModalProps {
  tenant: any
  onClose: () => void
}

export function EditTenantModal({ tenant, onClose }: EditTenantModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: tenant.name || "",
    slug: tenant.slug || "",
    document: tenant.document || "",
    planId: tenant.planId || "",
    subscriptionStatus: tenant.subscriptionStatus || "TRIAL"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await updateTenant(tenant.id, formData)
      if (result.success) {
        onClose()
      } else {
        setError(result.error || "Erro ao atualizar empresa")
      }
    } catch (err) {
      setError("Erro inesperado ao salvar.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Editar Empresa</h2>
              <p className="text-xs text-gray-500">ID: {tenant.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <Building2 size={14} className="text-indigo-500" /> Nome da Clínica
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <Globe size={14} className="text-indigo-500" /> Slug (URL)
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                <FileText size={14} className="text-indigo-500" /> CPF / CNPJ
              </label>
              <input
                type="text"
                value={formData.document}
                onChange={(e) => setFormData({...formData, document: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                  <Shield size={14} className="text-indigo-500" /> Plano
                </label>
                <select
                  value={formData.planId}
                  onChange={(e) => setFormData({...formData, planId: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value="plan_essencial">Essencial</option>
                  <option value="plan_profissional">Profissional</option>
                  <option value="plan_enterprise">Enterprise</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                  <Activity size={14} className="text-indigo-500" /> Status
                </label>
                <select
                  value={formData.subscriptionStatus}
                  onChange={(e) => setFormData({...formData, subscriptionStatus: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value="TRIAL">TRIAL</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PAST_DUE">PAST_DUE</option>
                  <option value="CANCELED">CANCELED</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
