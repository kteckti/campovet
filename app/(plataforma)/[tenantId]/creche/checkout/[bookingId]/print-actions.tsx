"use client"

import { Printer, FileText, Banknote } from "lucide-react"

export function PrintActions() {
  
  const handlePrint = (type: 'finance' | 'medical') => {
    // Adiciona uma classe temporária ao body para filtrar o que será impresso
    document.body.classList.remove('print-mode-finance', 'print-mode-medical')
    document.body.classList.add(`print-mode-${type}`)
    
    window.print()

    // Limpa depois (opcional, mas bom para resetar)
    // setTimeout(() => {
    //   document.body.classList.remove('print-mode-finance', 'print-mode-medical')
    // }, 1000)
  }

  return (
    <div className="flex gap-2 print:hidden">
      <button 
        onClick={() => handlePrint('finance')}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-blue-700 shadow-sm transition-colors text-sm"
      >
        <Banknote size={16} /> 
        Imprimir Financeiro
      </button>

      <button 
        onClick={() => handlePrint('medical')}
        className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-green-700 shadow-sm transition-colors text-sm"
      >
        <FileText size={16} /> 
        Imprimir Prontuário
      </button>
    </div>
  )
}