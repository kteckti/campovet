import Link from "next/link"
import { ShieldCheck, LayoutGrid, CreditCard, ArrowRight } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">CampoVet</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-indigo-600">Entrar</Link>
            <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors">Criar Conta</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight">
            Gestão <span className="text-indigo-600">Modular</span> para o Mercado Vet & Agro
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            A plataforma completa que cresce com o seu negócio. Escolha apenas os módulos que você precisa e pague pelo que usar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register" className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
              Começar Agora <ArrowRight size={20} />
            </Link>
            <Link href="#modulos" className="w-full sm:w-auto bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all">
              Ver Módulos
            </Link>
          </div>
        </div>
      </section>

      {/* Features/Modules */}
      <section id="modulos" className="py-20 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Soluções Especializadas</h2>
            <p className="text-gray-500 mt-4">Tudo o que você precisa em um único lugar.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Clínica Veterinária", desc: "Prontuários, internação, exames e financeiro clínico completo.", icon: <ShieldCheck className="text-indigo-600" /> },
              { title: "Creche & Hotel Pet", desc: "Gestão de baias, alimentação, atividades e pacotes de diárias.", icon: <LayoutGrid className="text-indigo-600" /> },
              { title: "Pet Sitter", desc: "Agendamentos, controle de visitas e cálculo de deslocamento.", icon: <CreditCard className="text-indigo-600" /> },
              { title: "Reprodução Equina", desc: "Controle de ciclos, coletas de sêmen e histórico reprodutivo.", icon: <ShieldCheck className="text-green-600" /> },
              { title: "Gado Leiteiro", desc: "Gestão de lactação, produção diária e métricas de desempenho.", icon: <LayoutGrid className="text-green-600" /> },
              { title: "Gado de Corte", desc: "Pesagens periódicas, ganho de peso e simulação de lucro.", icon: <CreditCard className="text-green-600" /> },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-50 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2026 CampoVet - Sistema de Gestão Modular Vet & Agro.</p>
        </div>
      </footer>
    </div>
  )
}
