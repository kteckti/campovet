import { db } from "@/src/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Stethoscope, FileText, Pill, Activity, PawPrint, History, CheckCircle } from "lucide-react"
import { finishConsultation, saveConsultation } from "@/src/actions/clinica" // Importe a nova action

interface PageProps {
  params: Promise<{ tenantId: string; appointmentId: string }>
}

export default async function AtendimentoPage({ params }: PageProps) {
  const { tenantId, appointmentId } = await params

  // 1. Buscar dados do agendamento E O PRONTUÁRIO ATUAL (se existir)
  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      medicalRecord: true, // <--- Importante: Pega o rascunho salvo deste atendimento
      pet: { 
        include: { 
          owner: true,
          // Histórico antigo
          medicalRecords: { 
            take: 3, 
            orderBy: { date: 'desc' },
            where: { appointmentId: { not: appointmentId } } 
          } 
        } 
      },
      veterinarian: true
    }
  })

  if (!appointment) return <div>Consulta não encontrada.</div>

  // Se já estiver finalizada
  if (appointment.status === "COMPLETED") {
    return (
      <div className="p-8 text-center bg-gray-50 min-h-screen flex flex-col items-center justify-center">
        <CheckCircle className="text-green-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Atendimento Finalizado!</h2>
        <p className="text-gray-500 mb-6">Este prontuário já foi fechado e não pode ser editado.</p>
        <div className="flex gap-4">
            <Link href={`/${tenantId}/clinica/agenda`} className="text-blue-600 font-bold hover:underline">Voltar para Agenda</Link>
            <Link href={`/${tenantId}/clinica/prontuario/${appointmentId}`} className="text-blue-600 font-bold hover:underline">Imprimir/Visualizar</Link>
        </div>
      </div>
    )
  }

  // Binds das actions
  const saveAction = saveConsultation.bind(null, tenantId, appointmentId)
  const finishAction = finishConsultation.bind(null, tenantId, appointmentId)

  // Dados para preencher os campos (Prioridade: O que já foi salvo no MedicalRecord > O que veio do Appointment > Vazio)
  const currentData = {
    complaint: appointment.medicalRecord?.complaint || appointment.reason || "",
    notes: appointment.medicalRecord?.notes || appointment.notes || "",
    diagnosis: appointment.medicalRecord?.diagnosis || "",
    prescription: appointment.medicalRecord?.prescription || ""
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 pt-6 px-4">
      
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/${tenantId}/clinica/agenda`} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Stethoscope className="text-blue-600" /> Prontuário Eletrônico
          </h1>
          <p className="text-sm text-gray-500 flex items-center gap-2">
             <span>{appointment.date.toLocaleDateString()} às {appointment.date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
             
             {/* Badge de Status */}
             {appointment.status === 'IN_PROGRESS' && (
                <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Em Atendimento (Rascunho Salvo)
                </span>
             )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA DA ESQUERDA: Informações do Paciente */}
        <div className="space-y-6">
          
          {/* Card do Paciente */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <PawPrint size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{appointment.pet.name}</h2>
                <p className="text-sm text-gray-500">{appointment.pet.species} • {appointment.pet.breed || 'SRD'}</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-4">
              <p><span className="font-semibold text-gray-800">Tutor:</span> {appointment.pet.owner.name}</p>
              <p><span className="font-semibold text-gray-800">Idade:</span> {appointment.pet.birthDate ? new Date(appointment.pet.birthDate).toLocaleDateString() : 'Não inf.'}</p>
              <p><span className="font-semibold text-gray-800">Peso:</span> {appointment.pet.weight ? `${appointment.pet.weight} kg` : '--'}</p>
              
              {(appointment.pet.allergies || appointment.pet.foodRestrictions) && (
                <div className="mt-3 bg-red-50 border border-red-100 p-3 rounded-lg text-red-800 text-xs">
                  <p className="font-bold mb-1">⚠️ Alertas:</p>
                  {appointment.pet.allergies && <p>Alergias: {appointment.pet.allergies}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Histórico Rápido */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <History size={18} className="text-gray-400" /> Histórico Recente
            </h3>
            <div className="space-y-4">
              {appointment.pet.medicalRecords.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Nenhum histórico anterior.</p>
              ) : (
                appointment.pet.medicalRecords.map(record => (
                  <div key={record.id} className="text-sm border-l-2 border-gray-300 pl-3 pb-1">
                    <p className="text-xs text-gray-500 font-medium">{new Date(record.date).toLocaleDateString()}</p>
                    <p className="font-semibold text-gray-700">{record.diagnosis || "Consulta de Rotina"}</p>
                    <p className="text-gray-500 line-clamp-2 text-xs mt-1">{record.notes}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* COLUNA DA DIREITA: Formulário */}
        <div className="lg:col-span-2">
          <form className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
            
            <input type="hidden" name="petId" value={appointment.pet.id} />
            <input type="hidden" name="vetId" value={appointment.veterinarian.id} />

            {/* Anamnese */}
            <div>
              <label className="flex items-center gap-2 font-bold text-gray-700 mb-2">
                <Activity size={18} className="text-orange-500" /> Queixa Principal (Anamnese)
              </label>
              <textarea 
                name="complaint" 
                rows={3} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Motivo da consulta relatado pelo tutor..."
                defaultValue={currentData.complaint} 
                required
              />
            </div>

            {/* Exame Físico */}
            <div>
              <label className="flex items-center gap-2 font-bold text-gray-700 mb-2">
                <FileText size={18} className="text-blue-500" /> Exame Físico & Observações
              </label>
              <textarea 
                name="notes" 
                rows={5} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Temperatura, frequência cardíaca, coloração de mucosas..."
                defaultValue={currentData.notes}
              />
            </div>

            {/* Diagnóstico */}
            <div>
              <label className="flex items-center gap-2 font-bold text-gray-700 mb-2">
                <Activity size={18} className="text-red-500" /> Diagnóstico
              </label>
              <input 
                name="diagnosis" 
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                placeholder="Ex: Otite Bacteriana"
                defaultValue={currentData.diagnosis}
              />
            </div>

            {/* Receita */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <label className="flex items-center gap-2 font-bold text-blue-800 mb-2">
                <Pill size={18} /> Prescrição / Receita
              </label>
              <textarea 
                name="prescription" 
                rows={6} 
                className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-mono text-sm"
                placeholder="1. Nome do Medicamento..."
                defaultValue={currentData.prescription}
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col md:flex-row items-center justify-end gap-4 pt-6 border-t border-gray-100 sticky bottom-0 bg-white p-2">
              
              <Link 
                href={`/${tenantId}/clinica/agenda`}
                className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Voltar
              </Link>
              
              <button 
                formAction={saveAction}
                className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-bold flex items-center gap-2 transition-all"
              >
                <Save size={20} /> Salvar Rascunho
              </button>

              <button 
                formAction={finishAction}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-green-200 transition-all hover:scale-105"
              >
                <CheckCircle size={20} /> Finalizar Atendimento
              </button>

            </div>

          </form>
        </div>
      </div>
    </div>
  )
}