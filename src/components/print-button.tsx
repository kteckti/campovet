"use client" // <--- Isso permite interatividade (onClick)

import { Printer } from "lucide-react"

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
    >
      <Printer size={18} /> 
      Imprimir / Salvar PDF
    </button>
  )
}