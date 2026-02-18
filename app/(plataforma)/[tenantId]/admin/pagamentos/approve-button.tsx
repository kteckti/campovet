"use client"

import { useState } from "react"
import { approvePayment } from "@/src/lib/actions/payment-actions"
import { Check, Loader2 } from "lucide-react"

export function ApproveButton({ requestId }: { requestId: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleApprove = async () => {
    if (!confirm("Deseja realmente aprovar este pagamento? O acesso será liberado por 1 mês.")) return
    
    setIsLoading(true)
    try {
      const result = await approvePayment(requestId)
      if (result.error) {
        alert(result.error)
      }
    } catch (error) {
      alert("Erro ao processar aprovação.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleApprove}
      disabled={isLoading}
      className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition-all disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={16} />
      ) : (
        <>
          <Check size={16} />
          Aprovar PIX
        </>
      )}
    </button>
  )
}
