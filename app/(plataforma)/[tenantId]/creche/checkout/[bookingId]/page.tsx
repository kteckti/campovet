import { db } from "@/src/lib/db"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Scissors } from "lucide-react"
import { PrintActions } from "./print-actions" // <--- Import Novo

interface PageProps {
  params: Promise<{ tenantId: string; bookingId: string }>
}

export default async function CheckoutReportPage({ params }: PageProps) {
  const { tenantId, bookingId } = await params

  // 1. Buscar a Reserva
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      pet: { include: { owner: true } },
      kennel: true,
      tenant: true,
      services: { include: { service: true } }
    }
  })

  if (!booking || !booking.endDate) return <div>Reserva não encontrada.</div>

  // 2. Buscar Logs
  const logs = await db.petLog.findMany({
    where: {
      petId: booking.petId,
      date: { gte: booking.startDate, lte: booking.endDate }
    },
    orderBy: { date: 'desc' }
  })

  // Cálculos
  const entrada = new Date(booking.startDate)
  const saida = new Date(booking.endDate)
  const diffTime = Math.abs(saida.getTime() - entrada.getTime())
  const diasCobrados = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1 
  const valorDiaria = Number(booking.kennel.dailyRate) || 0
  const subtotalHospedagem = diasCobrados * valorDiaria
  const totalServicos = booking.services.reduce((acc, item) => acc + Number(item.price), 0)
  const valorTotalFinal = Number(booking.totalCost) || 0

  return (
    <>
      {/* CSS PARA CONTROLE DE IMPRESSÃO */}
      <style>{`
        @media print {
          /* REMOVE A BARRA DE SCROLL DO PDF */
          ::-webkit-scrollbar {
            display: none !important;
          }
          * {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }

          /* Reset básico de impressão */
          @page { margin: 1cm; size: auto; }
          html, body { height: auto !important; overflow: visible !important; }
          
          #print-container {
            position: static !important;
            overflow: visible !important;
            height: auto !important;
          }
          
          /* Se estiver no modo FINANCEIRO, esconde a parte MÉDICA */
          body.print-mode-finance .section-medical { display: none !important; }
          
          /* Se estiver no modo MÉDICO, esconde a parte FINANCEIRA */
          body.print-mode-medical .section-finance { display: none !important; }
          
          /* Esconde linha de corte se não for mostrar tudo */
          body.print-mode-finance .print-cut-line, 
          body.print-mode-medical .print-cut-line { display: none !important; }
        }
      `}</style>

      <div id="print-container" className="fixed inset-0 z-[9999] p-8 bg-gray-50 min-h-screen overflow-y-auto print:bg-white print:p-0 print:m-0 print:w-full print:static print:overflow-visible print:h-auto">
        
        <div className="max-w-4xl mx-auto print:max-w-none print:w-full">
          
          {/* Botões de Ação */}
          <div className="flex justify-between items-center mb-8 print:hidden">
            <Link 
              href={`/${tenantId}/creche/baias`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm transition-colors text-sm"
            >
              <ArrowLeft size={18} /> Voltar
            </Link>
            
            {/* Componente com os 2 botões de imprimir */}
            <PrintActions />
          </div>

          {/* O DOCUMENTO */}
          <div className="bg-white shadow-lg p-10 rounded-xl print:shadow-none print:border-none print:p-0 text-gray-800 min-h-[29.7cm] print:h-auto print:overflow-visible">
            
            {/* Cabeçalho (Sempre aparece) */}
            <div className="border-b border-gray-200 pb-6 mb-6 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-900">{booking.tenant.name}</h1>
                <p className="text-sm text-gray-500">Relatório de Alta e Prestação de Contas</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm text-gray-500">Protocolo: #{booking.id.slice(-6).toUpperCase()}</p>
                <p className="text-sm font-bold text-green-600 flex items-center justify-end gap-1 mt-1">
                  <CheckCircle size={14} /> Finalizado
                </p>
              </div>
            </div>

            {/* ========== SEÇÃO FINANCEIRA ========== */}
            <div className="section-finance mb-10 break-inside-avoid">
              <h2 className="text-sm font-bold uppercase bg-gray-100 p-2 rounded mb-4 text-gray-700 border-l-4 border-blue-500">
                1. Demonstrativo Financeiro
              </h2>
              
              <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Tutor Responsável</p>
                  <p className="text-lg font-medium">{booking.pet.owner.name}</p>
                  <p className="text-gray-600">{booking.pet.owner.cpf ? `CPF: ${booking.pet.owner.cpf}` : ''}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold">Paciente (Pet)</p>
                  <p className="text-lg font-medium">{booking.pet.name}</p>
                  <p className="text-gray-600">{booking.pet.species} • {booking.pet.breed || 'SRD'}</p>
                </div>
              </div>

              {/* Tabela Diárias */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">A. Diárias de Hospedagem</h3>
                <table className="w-full text-sm border border-gray-200">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="p-2 text-left border-r">Acomodação</th>
                      <th className="p-2 text-center border-r">Entrada</th>
                      <th className="p-2 text-center border-r">Saída</th>
                      <th className="p-2 text-center border-r">Dias</th>
                      <th className="p-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-100">
                      <td className="p-2 border-r">
                        <span className="font-bold">{booking.kennel.name}</span>
                        <span className="text-xs text-gray-500 block">R$ {valorDiaria.toFixed(2)} / dia</span>
                      </td>
                      <td className="p-2 text-center border-r">{entrada.toLocaleDateString()} <br/> {entrada.toLocaleTimeString().slice(0,5)}</td>
                      <td className="p-2 text-center border-r">{saida.toLocaleDateString()} <br/> {saida.toLocaleTimeString().slice(0,5)}</td>
                      <td className="p-2 text-center border-r font-medium">{diasCobrados}</td>
                      <td className="p-2 text-right font-medium">R$ {subtotalHospedagem.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Tabela Serviços */}
              {booking.services.length > 0 && (
                <div className="mb-6 break-inside-avoid">
                  <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1 flex items-center gap-1">
                    <Scissors size={12} /> B. Serviços Adicionais
                  </h3>
                  <table className="w-full text-sm border border-gray-200">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="p-2 text-left border-r w-2/3">Descrição do Serviço</th>
                        <th className="p-2 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {booking.services.map((item) => (
                        <tr key={item.id}>
                          <td className="p-2 border-r">{item.service.name}</td>
                          <td className="p-2 text-right">R$ {Number(item.price).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-medium">
                        <td className="p-2 text-right border-r text-xs uppercase">Total Serviços</td>
                        <td className="p-2 text-right">R$ {totalServicos.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Total */}
              <div className="flex justify-end mt-4 break-inside-avoid">
                <div className="bg-gray-900 text-white px-8 py-4 rounded-lg text-right shadow-sm w-full md:w-auto">
                  <span className="text-sm text-gray-300 uppercase font-bold mr-6">Total a Pagar:</span>
                  <span className="text-3xl font-bold">R$ {valorTotalFinal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Linha de Corte (Só aparece se imprimir tudo junto - ou pode remover) */}
            <div className="print-cut-line border-t-2 border-dashed border-gray-300 my-8 relative print:my-6">
              <span className="absolute left-1/2 -top-3 -translate-x-1/2 bg-white px-2 text-xs text-gray-400">Corte aqui</span>
            </div>

            {/* ========== SEÇÃO MÉDICA ========== */}
            <div className="section-medical">
              <h2 className="text-sm font-bold uppercase bg-gray-100 p-2 rounded mb-4 text-gray-700 border-l-4 border-green-500">
                2. Resumo Clínico e Atividades
              </h2>

              <div className="grid grid-cols-2 gap-6 mb-6 text-sm break-inside-avoid">
                <div className="border p-4 rounded-lg bg-red-50/50 border-red-100">
                  <p className="font-bold text-red-800 mb-1">Alertas Médicos</p>
                  <p><span className="font-medium">Alergias:</span> {booking.pet.allergies || "Nenhuma registrada"}</p>
                  <p><span className="font-medium">Restrições:</span> {booking.pet.foodRestrictions || "Nenhuma registrada"}</p>
                </div>
                <div className="border p-4 rounded-lg bg-blue-50/50 border-blue-100">
                  <p className="font-bold text-blue-800 mb-1">Contatos Veterinários</p>
                  <p><span className="font-medium">Vet Responsável:</span> {booking.pet.vetName || "Não informado"}</p>
                  <p><span className="font-medium">Telefone:</span> {booking.pet.vetPhone || "-"}</p>
                </div>
              </div>

              <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Diário de Bordo</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left w-24">Horário</th>
                      <th className="p-2 text-left w-32">Tipo</th>
                      <th className="p-2 text-left">Descrição</th>
                      <th className="p-2 text-right">Resp.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-400 italic">Nenhuma atividade registrada.</td>
                      </tr>
                    ) : (
                      logs.map(log => (
                        <tr key={log.id} className="break-inside-avoid">
                          <td className="p-2 text-gray-500">{new Date(log.date).toLocaleDateString()} {new Date(log.date).toLocaleTimeString().slice(0,5)}</td>
                          <td className="p-2 font-medium">
                            {log.type === 'FOOD' ? 'Alimentação' : log.type === 'MEDICINE' ? 'Medicação' : 'Outros'}
                          </td>
                          <td className="p-2">{log.description}</td>
                          <td className="p-2 text-right text-gray-500 text-xs">{log.performedBy || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200 text-center text-xs text-gray-400 hidden print:block">
              <p>Documento gerado eletronicamente em {new Date().toLocaleString()} pelo sistema VetManager.</p>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}