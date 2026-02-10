import Link from "next/link"
import { db } from "@/src/lib/db"
import { Trash2, ArrowLeft, AlertTriangle, Pill, Activity, Save, Plus, Scissors, ShoppingBag } from "lucide-react"
import { updatePetHealth, addMedication, addPetLog, deactivateMedication, addServiceToBooking } from "@/src/actions/creche"
// IMPORT NOVO
import { PetLogsTimeline } from "./pet-logs-timeline" 

interface PageProps {
  params: Promise<{ tenantId: string; petId: string }>
}

export default async function FichaMedicaPage({ params }: PageProps) {
  const { tenantId, petId } = await params

  // 1. Buscar Pet Completo
  const pet = await db.pet.findUnique({
    where: { id: petId },
    include: {
      owner: true,
      medications: { where: { active: true } },
      // ALTERADO: Pega apenas os 5 primeiros inicialmente
      logs: { orderBy: { date: 'desc' }, take: 5 } 
    }
  })

  // 2. Buscar SE existe uma reserva ativa
  const activeBooking = await db.booking.findFirst({
    where: { 
      petId: petId, 
      status: "ACTIVE" 
    },
    include: {
      services: { include: { service: true } }
    }
  })

  // 3. Buscar catálogo
  const availableServices = await db.service.findMany({
    where: { tenant: { slug: tenantId } },
    orderBy: { name: 'asc' }
  })

  if (!pet) return <div>Pet não encontrado</div>

  const updateHealthWithId = updatePetHealth.bind(null, petId, tenantId)
  const addMedWithId = addMedication.bind(null, petId, tenantId)
  const addLogWithId = addPetLog.bind(null, petId, tenantId)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/${tenantId}/creche/baias`}
          className="text-gray-500 hover:text-gray-800 flex items-center gap-2 text-sm mb-2"
        >
          <ArrowLeft size={16} /> Voltar para baias
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              {pet.name}
              <span className="text-sm font-normal bg-gray-100 px-3 py-1 rounded-full text-gray-600 border border-gray-200">
                {pet.species} • {pet.breed || "SRD"}
              </span>
              {activeBooking && (
                <span className="text-sm font-bold bg-green-100 px-3 py-1 rounded-full text-green-700 border border-green-200 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/> Hospedado Agora
                </span>
              )}
            </h1>
            <p className="text-gray-500 mt-1">Tutor: {pet.owner.name} ({pet.owner.phone})</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* COLUNA 1: SERVIÇOS E DADOS MÉDICOS */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* PAINEL DE SERVIÇOS */}
          {activeBooking ? (
            <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm ring-4 ring-blue-50/50">
              <h2 className="font-bold text-lg text-blue-800 mb-4 flex items-center gap-2">
                <Scissors className="text-blue-600" size={20} />
                Serviços da Estadia
              </h2>

              <ul className="space-y-2 mb-4 bg-blue-50/50 p-3 rounded-lg">
                {activeBooking.services.length === 0 ? (
                  <p className="text-xs text-blue-400 italic">Nenhum serviço extra solicitado.</p>
                ) : (
                  activeBooking.services.map(item => (
                    <li key={item.id} className="flex justify-between text-sm text-blue-900 border-b border-blue-100 last:border-0 pb-1 last:pb-0">
                      <span>{item.service.name}</span>
                      <span className="font-bold">R$ {Number(item.price).toFixed(2)}</span>
                    </li>
                  ))
                )}
                {activeBooking.services.length > 0 && (
                   <li className="flex justify-between text-sm font-bold text-blue-900 pt-2 border-t border-blue-200">
                      <span>Total Extra:</span>
                      <span>R$ {activeBooking.services.reduce((acc, i) => acc + Number(i.price), 0).toFixed(2)}</span>
                   </li>
                )}
              </ul>

              <form action={async (formData) => {
                "use server"
                const serviceId = formData.get("serviceId") as string
                if(serviceId) {
                  await addServiceToBooking(activeBooking.id, serviceId, tenantId, petId)
                }
              }} className="flex gap-2">
                <select name="serviceId" className="flex-1 text-sm border border-blue-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">+ Adicionar Serviço...</option>
                  {availableServices.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (R$ {Number(s.price).toFixed(2)})</option>
                  ))}
                </select>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors">
                  <Plus size={18} />
                </button>
              </form>
            </div>
          ) : (
             <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 text-center">
                <ShoppingBag className="mx-auto text-gray-300 mb-2 h-6 w-6" />
                <p className="text-sm text-gray-500">O pet não está hospedado no momento. Check-in necessário para adicionar serviços.</p>
             </div>
          )}

          {/* DADOS CRÍTICOS */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-orange-500" size={20} />
              Alertas & Saúde
            </h2>

            <form action={updateHealthWithId} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Alergias</label>
                <textarea name="allergies" defaultValue={pet.allergies || ""} placeholder="Nenhuma alergia registrada..." rows={2} className="w-full text-sm p-2 border border-red-100 bg-red-50 rounded-lg focus:ring-red-500 focus:border-red-500 text-gray-800 placeholder-red-300" />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Restrição Alimentar</label>
                <textarea name="foodRestrictions" defaultValue={pet.foodRestrictions || ""} placeholder="Ex: Só come ração X..." rows={2} className="w-full text-sm p-2 border border-yellow-100 bg-yellow-50 rounded-lg text-gray-800" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Veterinário</label>
                  <input name="vetName" defaultValue={pet.vetName || ""} type="text" placeholder="Nome do Vet" className="w-full text-sm p-2 border border-gray-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Tel. Vet</label>
                  <input name="vetPhone" defaultValue={pet.vetPhone || ""} type="text" placeholder="(00) 0000" className="w-full text-sm p-2 border border-gray-200 rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Notas Comportamentais</label>
                <textarea name="notes" defaultValue={pet.notes || ""} placeholder="Ex: Medo de trovão..." rows={2} className="w-full text-sm p-2 border border-gray-200 rounded-lg" />
              </div>

              <button type="submit" className="w-full bg-gray-800 hover:bg-black text-white py-2 rounded-lg text-sm font-medium flex justify-center items-center gap-2">
                <Save size={14} /> Atualizar Ficha
              </button>
            </form>
          </div>

          {/* Card de Medicações */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <Pill className="text-blue-500" size={20} />
              Medicações Ativas
            </h2>

            <ul className="space-y-3 mb-4">
              {pet.medications.length === 0 ? (
                <li className="text-sm text-gray-400 italic">Nenhum remédio ativo.</li>
              ) : (
                pet.medications.map(med => {
                  const removeMedAction = deactivateMedication.bind(null, med.id, tenantId, pet.id)
                  return (
                    <li key={med.id} className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex justify-between items-start group">
                      <div>
                        <p className="font-bold text-blue-800 text-sm">{med.name}</p>
                        <p className="text-xs text-blue-600">{med.dosage} • {med.frequency}</p>
                      </div>
                      <form action={removeMedAction}>
                        <button type="submit" className="text-blue-300 hover:text-red-500 transition-colors p-1">
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </li>
                  )
                })
              )}
            </ul>

            <form action={addMedWithId} className="border-t border-gray-100 pt-3">
              <p className="text-xs font-semibold text-gray-500 mb-2">Adicionar Novo:</p>
              <div className="space-y-2">
                <input name="name" required placeholder="Nome do remédio" className="w-full text-sm p-2 border border-gray-200 rounded-lg" />
                <div className="flex gap-2">
                  <input name="dosage" placeholder="Dose (1cp)" className="w-1/2 text-sm p-2 border border-gray-200 rounded-lg" />
                  <input name="frequency" placeholder="Freq (12h)" className="w-1/2 text-sm p-2 border border-gray-200 rounded-lg" />
                </div>
                <button className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200 py-1.5 rounded-lg text-xs font-bold">
                  + Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* COLUNA 2: DIÁRIO DE BORDO (Logs) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Formulário de Registro */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="text-green-600" size={20} />
              Registrar Atividade / Cuidado
            </h2>

            <form action={addLogWithId} className="space-y-3">
              <div className="flex gap-3">
                <div className="w-1/3">
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Tipo de Ação</label>
                  <select name="type" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 font-medium mt-1">
                    <option value="FOOD">Alimentação</option>
                    <option value="MEDICINE">Medicação</option>
                    <option value="EXERCISE">Exercício/Lazer</option>
                    <option value="OBSERVATION">Observação</option>
                  </select>
                </div>
                <div className="w-2/3">
                  <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Responsável pela Aplicação *</label>
                  <input
                    name="performedBy"
                    required
                    placeholder="Ex: Dra. Ana, Tratador Carlos..."
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm mt-1 focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  name="description"
                  required
                  placeholder="Descreva o que aconteceu..."
                  className="flex-1 p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors">
                  <Plus size={18} />
                  Registrar
                </button>
              </div>
            </form>
          </div>

          {/* Timeline de Histórico (COMPONENTE CLIENTE) */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[400px]">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-6">Histórico Recente</h3>
            
            {/* AQUI ESTÁ A LISTA INTERATIVA */}
            <PetLogsTimeline 
              initialLogs={pet.logs} 
              petId={petId} 
            />
            
          </div>
        </div>
      </div>
    </div>
  )
}