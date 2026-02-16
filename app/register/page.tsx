"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Check, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  Building2, 
  Mail, 
  Lock, 
  User,
  Zap,
  Star,
  Crown
} from "lucide-react"
import Link from "next/link"
import { registerTenant, getPlans, getModules } from "@/src/lib/actions/register-actions"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    clinicName: "",
    planId: "plan_essencial",
    selectedModules: [] as string[],
    cardNumber: "",
    cardExpiry: "",
    cardCvc: ""
  })

  const [plans, setPlans] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      const p = await getPlans()
      const m = await getModules()
      setPlans(p)
      setModules(m)
    }
    fetchData()
  }, [])

  const handleModuleToggle = (moduleId: string) => {
    const plan = plans.find(p => p.id === formData.planId)
    const maxModules = formData.planId === "plan_essencial" ? 1 : (formData.planId === "plan_profissional" ? 3 : 10)
    
    if (formData.selectedModules.includes(moduleId)) {
      setFormData({
        ...formData,
        selectedModules: formData.selectedModules.filter(id => id !== moduleId)
      })
    } else {
      if (formData.selectedModules.length < maxModules) {
        setFormData({
          ...formData,
          selectedModules: [...formData.selectedModules, moduleId]
        })
      }
    }
  }

  const handlePlanSelect = (planId: string) => {
    setFormData({
      ...formData,
      planId,
      selectedModules: [] // Reseta módulos ao trocar plano
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 4) {
      setStep(step + 1)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await registerTenant(formData)
      if (result.error) {
        setError(result.error)
        setStep(1) // Volta para o início em caso de erro de dados
      } else {
        router.push("/login?registered=true")
      }
    } catch (err) {
      setError("Ocorreu um erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 py-12">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-indigo-200">
            C
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Crie sua conta no CampoVet</h1>
          <p className="text-gray-500 mt-2">Comece seu teste gratuito de 3 dias hoje mesmo</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-12 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= i ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-white text-gray-400 border border-gray-200"
              }`}>
                {step > i ? <Check size={20} /> : i}
              </div>
              {i < 4 && (
                <div className={`w-12 h-1px mx-2 ${step > i ? "bg-indigo-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-12">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center mb-8">
                {error}
              </div>
            )}

            {/* Step 1: Dados Pessoais e Clínica */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Informações Básicas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Seu Nome</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-12 py-4 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="Nome completo"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">E-mail Profissional</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-12 py-4 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="exemplo@email.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Nome da Clínica/Empresa</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        required
                        value={formData.clinicName}
                        onChange={(e) => setFormData({...formData, clinicName: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-12 py-4 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="Nome da sua clínica"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Senha de Acesso</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-12 py-4 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Seleção de Plano */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Escolha seu Plano</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <div 
                      key={plan.id}
                      onClick={() => handlePlanSelect(plan.id)}
                      className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                        formData.planId === plan.id 
                        ? "border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-500/10" 
                        : "border-gray-100 hover:border-gray-200 bg-white"
                      }`}
                    >
                      {formData.planId === plan.id && (
                        <div className="absolute -top-3 -right-3 bg-indigo-600 text-white rounded-full p-1 shadow-lg">
                          <Check size={16} />
                        </div>
                      )}
                      <div className="mb-4">
                        {plan.id === 'plan_essencial' && <Zap className="text-amber-500 mb-2" size={24} />}
                        {plan.id === 'plan_profissional' && <Star className="text-indigo-600 mb-2" size={24} />}
                        {plan.id === 'plan_enterprise' && <Crown className="text-purple-600 mb-2" size={24} />}
                        <h3 className="font-bold text-lg text-gray-900">{plan.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                      </div>
                      <div className="mt-auto">
                        <span className="text-2xl font-bold text-gray-900">R$ {Number(plan.price).toFixed(0)}</span>
                        <span className="text-gray-500 text-sm">/mês</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Seleção de Módulos */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Selecione seus Módulos</h2>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                    {formData.selectedModules.length} / {formData.planId === "plan_essencial" ? 1 : (formData.planId === "plan_profissional" ? 3 : "Ilimitados")}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {modules.map((mod) => {
                    const isSelected = formData.selectedModules.includes(mod.id)
                    const isDisabled = !isSelected && (
                      (formData.planId === "plan_essencial" && formData.selectedModules.length >= 1) ||
                      (formData.planId === "plan_profissional" && formData.selectedModules.length >= 3)
                    ) && formData.planId !== "plan_enterprise"

                    return (
                      <div 
                        key={mod.id}
                        onClick={() => !isDisabled && handleModuleToggle(mod.id)}
                        className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                          isSelected 
                          ? "border-indigo-600 bg-indigo-50/50 text-indigo-900" 
                          : isDisabled 
                            ? "border-gray-50 bg-gray-50 opacity-50 cursor-not-allowed" 
                            : "border-gray-100 hover:border-gray-200 cursor-pointer text-gray-700"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                          isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-300"
                        }`}>
                          {isSelected && <Check size={14} />}
                        </div>
                        <span className="font-medium text-sm">{mod.name}</span>
                      </div>
                    )
                  })}
                </div>
                {formData.planId !== "plan_enterprise" && formData.selectedModules.length === 0 && (
                  <p className="text-amber-600 text-xs font-medium">Por favor, selecione pelo menos um módulo.</p>
                )}
              </div>
            )}

            {/* Step 4: Pagamento / Cartão */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-indigo-600 rounded-2xl p-6 text-white mb-8">
                  <div className="flex justify-between items-start mb-8">
                    <ShieldCheck size={32} />
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">Teste Grátis - 3 Dias</span>
                  </div>
                  <p className="text-sm opacity-90 mb-1">Total hoje</p>
                  <h3 className="text-3xl font-bold">R$ 0,00</h3>
                  <p className="text-xs mt-4 opacity-70">
                    A cobrança de R$ {Number(plans.find(p => p.id === formData.planId)?.price).toFixed(2)} será efetuada automaticamente em 3 dias. Cancele a qualquer momento antes disso.
                  </p>
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-6">Dados do Cartão</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Número do Cartão</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        required
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-12 py-4 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="0000 0000 0000 0000"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Validade</label>
                      <input
                        type="text"
                        required
                        value={formData.cardExpiry}
                        onChange={(e) => setFormData({...formData, cardExpiry: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="MM/AA"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">CVC</label>
                      <input
                        type="text"
                        required
                        value={formData.cardCvc}
                        onChange={(e) => setFormData({...formData, cardCvc: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-12 flex items-center justify-between gap-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-700 transition-all"
                >
                  <ArrowLeft size={20} /> Voltar
                </button>
              ) : (
                <Link href="/login" className="text-gray-500 font-bold hover:text-gray-700 transition-all">
                  Já tenho conta
                </Link>
              )}

              <button
                type="submit"
                disabled={isLoading || (step === 3 && formData.selectedModules.length === 0 && formData.planId !== "plan_enterprise")}
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {step === 4 ? "Finalizar Cadastro" : "Próximo Passo"}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-gray-400 text-xs mt-8">
          Ao se cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade.<br />
          Ambiente seguro e criptografado.
        </p>
      </div>
    </div>
  )
}
