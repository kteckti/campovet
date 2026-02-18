"use client"

import Link from "next/link"
import { MODULE_DEFINITIONS, DEFAULT_MENU } from "@/src/utils/app-modules"
import { Scissors, DollarSign, Users, LogOut, ShieldCheck, X } from "lucide-react"
import { useSession, signOut } from "next-auth/react"

interface SidebarProps {
  tenantSlug: string
  activeModules: string[] 
  className?: string
  isOpen?: boolean // Novo: Controla visibilidade no mobile
  onClose?: () => void // Novo: Fecha no mobile
}

export function Sidebar({ tenantSlug, activeModules, className, isOpen, onClose }: SidebarProps) {
  const { data: session } = useSession()
  const user = session?.user as any

  // Classes base para Desktop (fixo) e Mobile (gaveta)
  const mobileClasses = `fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-auto md:flex`

  return (
    <>
      {/* Overlay Escuro para Mobile (só aparece quando aberto) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Principal */}
      <aside className={`${mobileClasses} bg-slate-900 text-white flex flex-col h-screen print:hidden ${className}`}>
        
        {/* Logo e Botão Fechar (Mobile) */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Vet<span className="text-blue-400">Manager</span></h2>
            <p className="text-xs text-slate-400 mt-1">ERP Integrado</p>
          </div>
          {/* Botão X só aparece no mobile */}
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            
            {/* 1. Itens Padrão (Dashboard) */}
            {DEFAULT_MENU.map((item) => (
              <li key={item.href}>
                <Link 
                  href={`/${tenantSlug}${item.href}`}
                  onClick={onClose} // Fecha ao clicar no mobile
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}

            {/* === ITEM ADICIONADO: SERVIÇOS === */}
            <li>
              <Link 
                href={`/${tenantSlug}/servicos`}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
              >
                <Scissors className="w-5 h-5" />
                <span className="font-medium">Catálogo de Serviços</span>
              </Link>
            </li>

            {/* === ITEM ADICIONADO: FINANCEIRO === */}
            <li>
              <Link 
                href={`/${tenantSlug}/financeiro`}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
              >
                <DollarSign className="w-5 h-5" />
                <span className="font-medium">Financeiro</span>
              </Link>
            </li>

            {/* Divisor */}
            <div className="my-4 border-t border-slate-800 mx-2" />
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase mb-2">
              Módulos Contratados
            </p>

            {/* 2. Módulos Ativos (Dinâmico do Banco) */}
            {activeModules.map((moduleId) => {
              const def = MODULE_DEFINITIONS[moduleId]
              if (!def) return null 

              return (
                <li key={moduleId}>
                  <Link 
                    href={`/${tenantSlug}${def.href}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-900/50 hover:text-blue-200 transition-colors text-slate-300"
                  >
                    <def.icon className="w-5 h-5" />
                    <span className="font-medium">{def.label}</span>
                  </Link>
                </li>
              )
            })}

            {/* Divisor Admin */}
            <div className="my-4 border-t border-slate-800 mx-2" />
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase mb-2">
              Administração
            </p>

            {/* === ITEM ADICIONADO: EQUIPE === */}
            <li>
              <Link 
                href={`/${tenantSlug}/configuracoes/equipe`}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">Equipe & Acessos</span>
              </Link>
            </li>

            {/* === ITEM ADICIONADO: PAGAMENTO === */}
            <li>
              <Link 
                href={`/${tenantSlug}/pagamento`}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
              >
                <DollarSign className="w-5 h-5" />
                <span className="font-medium">Minha Assinatura</span>
              </Link>
            </li>

            {/* === ITEM ADICIONADO: ADMIN CENTRAL === */}
            {user?.email === "kteckti@gmail.com" && (
              <li>
                <Link 
                  href="/admin/clientes"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 transition-colors text-indigo-300 hover:text-indigo-200 border border-indigo-500/30"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-medium">Painel Central</span>
                </Link>
              </li>
            )}

          </ul>
        </nav>

        {/* Rodapé do Menu */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center font-bold text-xs">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="text-sm truncate">
                <p className="font-medium truncate">{user?.name || "Usuário"}</p>
                <p className="text-[10px] text-slate-500 truncate capitalize">{user?.role?.toLowerCase() || "Acesso"}</p>
              </div>
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
              title="Sair do sistema"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}