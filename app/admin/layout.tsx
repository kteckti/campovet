import Link from "next/link"
import { LayoutDashboard, Users, DollarSign, LogOut, ShieldCheck } from "lucide-react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (session?.user?.email !== "kteckti@gmail.com") {
    redirect("/")
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {/* Sidebar Admin */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
              C
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">CampoVet</h1>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Painel Central</span>
            </div>
          </div>

          <nav className="space-y-1">
            <Link 
              href="/admin/clientes"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all text-slate-300 hover:text-white group"
            >
              <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Gestão de Clientes</span>
            </Link>
            
            <Link 
              href="/admin/pagamentos"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all text-slate-300 hover:text-white group"
            >
              <DollarSign className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Financeiro</span>
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-800">
          <Link 
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all text-slate-400 hover:text-red-400 group"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair do Admin</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ShieldCheck size={16} className="text-indigo-600" />
            <span className="font-bold text-gray-900">SuperAdmin</span>
            <span className="mx-2">/</span>
            <span className="capitalize">Gestão do Sistema</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-gray-900">Administrador Central</p>
              <p className="text-[10px] text-gray-500">{session.user.email}</p>
            </div>
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
              AD
            </div>
          </div>
        </header>
        
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
