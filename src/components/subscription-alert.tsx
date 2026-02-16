"use client"

import { useEffect, useState } from "react"
import { getSubscriptionStatus } from "@/src/lib/actions/payment-actions"
import { AlertTriangle, ArrowRight, X } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export function SubscriptionAlert() {
  const params = useParams()
  const tenantId = params.tenantId as string
  const [status, setStatus] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    async function checkStatus() {
      const res = await getSubscriptionStatus()
      setStatus(res)
    }
    checkStatus()
  }, [])

  if (!status || !isVisible) return null
  if (!status.isExpiringSoon && !status.isExpired) return null

  return (
    <div className={`fixed bottom-6 right-6 left-6 md:left-auto md:w-96 z-50 animate-in slide-in-from-bottom-8 duration-500`}>
      <div className={`rounded-2xl shadow-2xl border p-6 ${
        status.isExpired 
        ? "bg-red-600 border-red-500 text-white" 
        : "bg-amber-500 border-amber-400 text-white"
      }`}>
        <div className="flex justify-between items-start mb-4">
          <div className="bg-white/20 p-2 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <button onClick={() => setIsVisible(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <h3 className="text-lg font-bold mb-1">
          {status.isExpired ? "Assinatura Expirada" : "Assinatura Vencendo"}
        </h3>
        <p className="text-sm opacity-90 mb-6">
          {status.isExpired 
            ? "Seu acesso foi limitado. Realize o pagamento para continuar utilizando todos os recursos."
            : `Seu período de ${status.status === 'TRIAL' ? 'teste' : 'assinatura'} termina em ${status.daysRemaining} ${status.daysRemaining === 1 ? 'dia' : 'dias'}.`}
        </p>

        <Link 
          href={`/${tenantId}/pagamento`}
          className="flex items-center justify-center gap-2 bg-white text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all"
        >
          Ir para Pagamentos
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  )
}
