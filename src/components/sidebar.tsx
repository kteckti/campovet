import Link from "next/link"
import { MODULE_DEFINITIONS, DEFAULT_MENU } from "@/src/utils/app-modules"
import { Scissors, DollarSign } from "lucide-react" // <--- Import dos ícones

interface SidebarProps {
  tenantSlug: string
  activeModules: string[] 
  className?: string
}

export function Sidebar({ tenantSlug, activeModules, className }: SidebarProps) {
  return (
    // 'print:hidden' garante que o menu suma na impressão
    <aside className={`w-64 bg-slate-900 text-white flex flex-col h-screen print:hidden ${className}`}>
      
      {/* Logo da Empresa */}
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold tracking-tight">Vet<span className="text-blue-400">Manager</span></h2>
        <p className="text-xs text-slate-400 mt-1">ERP Integrado</p>
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          
          {/* 1. Itens Padrão (Dashboard) */}
          {DEFAULT_MENU.map((item) => (
            <li key={item.href}>
              <Link 
                href={`/${tenantSlug}${item.href}`}
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
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-900/50 hover:text-blue-200 transition-colors text-slate-300"
                >
                  <def.icon className="w-5 h-5" />
                  <span className="font-medium">{def.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Rodapé do Menu */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
            U
          </div>
          <div className="text-sm">
            <p className="font-medium">Usuário Teste</p>
            <p className="text-xs text-slate-500">Sair</p>
          </div>
        </div>
      </div>
    </aside>
  )
}