import { auth } from "@/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import { LayoutGrid, CheckCircle2, Lock, ArrowRight } from "lucide-react"

export default async function ModulesPage() {
  const session = await auth()
  
  if (!session) redirect("/login")

  const user = session.user as any
  const tenantSlug = user.tenantSlug
  const activeModules = user.modules || []
  const isPremium = user.plan?.isPremium

  const allModules = [
    { id: "mod_clinica", name: "Clínica Veterinária", path: "clinica", color: "bg-blue-500" },
    { id: "mod_creche", name: "Creche & Hotel Pet", path: "creche", color: "bg-indigo-500" },
    { id: "mod_pet_sitter", name: "Pet Sitter", path: "pet-sitter", color: "bg-purple-500" },
    { id: "mod_equinos", name: "Reprodução Equina", path: "equinos", color: "bg-emerald-500" },
    { id: "mod_leite", name: "Gado Leiteiro", path: "leite", color: "bg-green-500" },
    { id: "mod_corte", name: "Gado de Corte", path: "corte", color: "bg-orange-500" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Olá, {user.name}</h1>
          <p className="text-gray-500 mt-2">Selecione o módulo que deseja acessar hoje.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allModules.map((mod) => {
            const hasAccess = isPremium || activeModules.includes(mod.id)
            
            return (
              <div 
                key={mod.id} 
                className={`relative bg-white rounded-2xl shadow-sm border p-6 transition-all ${
                  hasAccess 
                  ? "border-gray-100 hover:shadow-md hover:border-indigo-200" 
                  : "border-gray-200 opacity-75 grayscale-[0.5]"
                }`}
              >
                <div className={`w-12 h-12 ${mod.color} rounded-xl mb-6 flex items-center justify-center text-white`}>
                  <LayoutGrid size={24} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{mod.name}</h3>
                
                {hasAccess ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                      <CheckCircle2 size={16} /> Módulo Ativo
                    </div>
                    <Link 
                      href={`/${tenantSlug}/${mod.path}`}
                      className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                    >
                      Acessar <ArrowRight size={18} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                      <Lock size={16} /> Bloqueado no seu plano
                    </div>
                    <Link 
                      href="/billing"
                      className="w-full bg-white text-gray-700 border border-gray-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                      Fazer Upgrade
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
