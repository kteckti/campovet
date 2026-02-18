"use client"

import { useState } from "react"
import { Sidebar } from "@/src/components/sidebar"
import { SubscriptionAlert } from "@/src/components/subscription-alert"
import { Menu } from "lucide-react"

interface LayoutShellProps {
  children: React.ReactNode
  tenantSlug: string
  activeModules: string[]
  tenantName: string
}

export function LayoutShell({ children, tenantSlug, activeModules, tenantName }: LayoutShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      
      {/* Sidebar (Controlada pelo estado no mobile) */}
      <Sidebar 
        tenantSlug={tenantSlug} 
        activeModules={activeModules}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header Fixo */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-8 shadow-sm flex-shrink-0 z-10 relative">
          
          {/* Botão Menu (Só aparece no mobile) */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>

          <h1 className="font-semibold text-lg text-gray-700 truncate">
            {tenantName}
          </h1>
        </header>

        <SubscriptionAlert />

        {/* Área de Conteúdo Scrollável */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>

    </div>
  )
}