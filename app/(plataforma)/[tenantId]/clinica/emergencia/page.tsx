import { db } from "@/src/lib/db"
import Link from "next/link"
import { Siren, ArrowLeft, User, Stethoscope, PawPrint, Activity } from "lucide-react"
import { createEmergencyAppointment } from "@/src/actions/emergencia"
import { getVeterinarians } from "@/src/actions/clinica"

interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function EmergenciaPage({ params }: PageProps) {
  const { tenantId } = await params
  
  // Busca veterinários para o select
  const vets = await getVeterinarians(tenantId)

  // Bind da action para passar o tenantId
  const createAction = createEmergencyAppointment.bind(null, tenantId)

  return (
    <div className="max-w-2xl mx-auto min-h-[80vh] flex flex-col justify-center">
      
      <div className="mb-6">
        <Link 
          href={`/${tenantId}/clinica`}
          className="text-gray-500 hover:text-gray-800 flex items-center gap-2 mb-4 transition-colors"
        >
          <ArrowLeft size={20} /> Cancelar e Voltar
        </Link>

        <div className="flex items-center gap-3 text-red-600 mb-2">
          <div className="p-3 bg-red-100 rounded-full animate-pulse">
            <Siren size={32} />
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-wide">Plantão de Emergência</h1>
        </div>
        <p className="text-gray-500">
          Utilize este formulário apenas para casos de <strong>risco iminente</strong>. 
          Isso criará um cadastro provisório e iniciará o atendimento imediatamente.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-2 border-red-100 overflow-hidden">
        <div className="bg-red-50 px-8 py-4 border-b border-red-100 flex items-center gap-2 text-red-800 text-sm font-bold">
          <Activity size={16} /> Fast-Track: Cadastro Simplificado
        </div>
        
        <form action={createAction} className="p-8 space-y-6">
          
          {/* Veterinário Responsável */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Veterinário Responsável</label>
            <div className="relative">
              <Stethoscope className="absolute left-3 top-3 text-gray-400" size={18} />
              <select 
                name="vetId" 
                required 
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all font-medium text-gray-800"
              >
                <option value="">Selecione o plantonista...</option>
                {vets.map(vet => (
                  <option key={vet.id} value={vet.id}>{vet.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tutor */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nome do Tutor (Responsável)</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  name="tutorName" 
                  required 
                  placeholder="Ex: Maria (Desconhecido)" 
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* Nome do Pet */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nome / Identificação do Pet</label>
              <div className="relative">
                <PawPrint className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  name="petName" 
                  required 
                  placeholder="Ex: Rex (Cão Atropelado)" 
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Espécie e Queixa */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Espécie</label>
              <select name="species" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white outline-none">
                <option value="Cachorro">Cachorro</option>
                <option value="Gato">Gato</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Motivo / Queixa Principal</label>
              <input 
                name="complaint" 
                required 
                placeholder="Ex: Atropelamento, Convulsão..." 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-red-200 transform active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <Siren size={24} className="animate-pulse" />
              INICIAR ATENDIMENTO AGORA
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              Ao clicar, um prontuário será aberto imediatamente.
            </p>
          </div>

        </form>
      </div>
    </div>
  )
}