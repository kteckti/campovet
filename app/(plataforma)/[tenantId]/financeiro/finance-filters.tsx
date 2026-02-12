"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Printer, Filter } from "lucide-react"
import { FormEvent } from "react"

export function FinanceFilters({ tenantSlug }: { tenantSlug: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentStart = searchParams.get("start") || ""
  const currentEnd = searchParams.get("end") || ""

  const handleFilter = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const start = formData.get("start") as string
    const end = formData.get("end") as string
    
    // Atualiza a URL com os parâmetros de data
    router.push(`/${tenantSlug}/financeiro?start=${start}&end=${end}`)
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 justify-between items-center print:hidden">
      
      <form onSubmit={handleFilter} className="flex items-center gap-3">
        <Filter size={18} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-600">Período:</span>
        
        <input 
          type="date" 
          name="start" 
          defaultValue={currentStart} 
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none" 
        />
        <span className="text-gray-400">até</span>
        <input 
          type="date" 
          name="end" 
          defaultValue={currentEnd} 
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none" 
        />
        
        <button type="submit" className="bg-gray-800 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors">
          Filtrar
        </button>
      </form>

      <button 
        onClick={() => window.print()}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
      >
        <Printer size={16} /> Imprimir Relatório
      </button>
    </div>
  )
}
