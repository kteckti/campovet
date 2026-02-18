"use client"

import { useState } from "react"
import { grantManualAccess, resetUserPassword } from "@/src/lib/actions/admin-actions"
import { Key, Gift, Loader2, Check, X, Edit2 } from "lucide-react"
import { EditTenantModal } from "./edit-tenant-modal"

interface ClientActionsProps {
  tenant: any
  tenantId: string
  tenantName: string
  adminUserId?: string
  adminEmail?: string
}

export function ClientActions({ tenant, tenantId, tenantName, adminUserId, adminEmail }: ClientActionsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleGrantAccess = async () => {
    const days = prompt(`Quantos dias de acesso deseja liberar para ${tenantName}?`, "30")
    if (!days) return
    
    const notes = prompt("Motivo da liberação (ex: Parceria, Cortesia, Erro no PIX):")
    if (!notes) return

    setIsLoading(true)
    try {
      const result = await grantManualAccess(tenantId, parseInt(days), notes)
      if (result.success) {
        alert(`Acesso liberado por ${days} dias com sucesso!`)
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert("Erro ao processar liberação.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!adminUserId) return
    const newPassword = prompt(`Digite a nova senha para o usuário ${adminEmail}:`)
    if (!newPassword || newPassword.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.")
      return
    }

    setIsLoading(true)
    try {
      const result = await resetUserPassword(adminUserId, newPassword)
      if (result.success) {
        alert("Senha resetada com sucesso!")
      } else {
        alert(result.error)
      }
    } catch (error) {
      alert("Erro ao resetar senha.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setIsEditing(true)}
        disabled={isLoading}
        className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all disabled:opacity-50 shadow-sm"
        title="Editar dados da empresa"
      >
        <Edit2 size={16} />
        Editar
      </button>

      <button
        onClick={handleGrantAccess}
        disabled={isLoading}
        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-sm"
        title="Liberar dias manualmente"
      >
        {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Gift size={16} />}
        Liberar Acesso
      </button>

      <button
        onClick={handleResetPassword}
        disabled={isLoading || !adminUserId}
        className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all disabled:opacity-50 shadow-sm"
        title="Resetar senha do administrador"
      >
        {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Key size={16} />}
        Resetar Senha
      </button>

      {isEditing && (
        <EditTenantModal 
          tenant={tenant} 
          onClose={() => setIsEditing(false)} 
        />
      )}
    </div>
  )
}
