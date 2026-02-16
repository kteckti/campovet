"use client"

import { useState } from "react"
import { requestPaymentConfirmation } from "@/src/lib/actions/payment-actions"
import { Check, Copy, Loader2, Send } from "lucide-react"

export function PixPaymentClient({ amount }: { amount: number }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const PIX_KEY = "7bd12887-e9fa-4edd-9f52-da5f41d68724"

  const handleCopy = () => {
    navigator.clipboard.writeText(PIX_KEY)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      const result = await requestPaymentConfirmation(amount)
      if (result.success) {
        setIsSent(true)
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert("Erro ao enviar solicitação.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg shadow-indigo-900/20"
        >
          {copied ? <Check size={20} /> : <Copy size={20} />}
          {copied ? "Copiado!" : "Copiar Chave PIX"}
        </button>

        <button
          onClick={handleConfirm}
          disabled={isLoading || isSent}
          className="flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-400 transition-all border border-indigo-400 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : isSent ? (
            <>
              <Check size={20} />
              Solicitação Enviada
            </>
          ) : (
            <>
              <Send size={20} />
              Já realizei o PIX
            </>
          )}
        </button>
      </div>
      
      {isSent && (
        <p className="text-sm text-indigo-200 animate-in fade-in slide-in-from-top-2">
          ✅ Recebemos sua solicitação! Nossa equipe irá validar o pagamento e liberar seu acesso em breve.
        </p>
      )}
    </div>
  )
}
