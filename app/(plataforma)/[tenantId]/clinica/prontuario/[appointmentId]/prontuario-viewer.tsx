"use client"

import { useState } from "react"
import { Printer, ArrowLeft, Scissors, Phone, MapPin, FileText, Pill } from "lucide-react"
import Link from "next/link"

interface ProntuarioViewerProps {
  data: {
    appointmentId: string
    tenant: any
    pet: any
    veterinarian: any
    medicalRecord: any
  }
  tenantSlug: string
}

export function ProntuarioViewer({ data, tenantSlug }: ProntuarioViewerProps) {
  // Controle de Abas: 'RESUMO' ou 'RECEITA'
  const [activeTab, setActiveTab] = useState<'RESUMO' | 'RECEITA'>('RESUMO')

  const { tenant, pet, veterinarian, medicalRecord } = data

  // Função que troca a aba e imprime
  const handlePrint = (mode: 'RESUMO' | 'RECEITA') => {
    setActiveTab(mode)
    // Pequeno delay para garantir que o React renderizou a aba certa antes de abrir o print
    setTimeout(() => {
      window.print()
    }, 100)
  }

  return (
    <div className="bg-gray-100 min-h-screen p-8 print:p-0 print:bg-white">
      
      {/* === BARRA DE CONTROLE (Oculta na impressão) === */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <Link 
          href={`/${tenantSlug}/clinica/agenda`}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-lg shadow-sm"
        >
          <ArrowLeft size={20} /> Voltar
        </Link>
        
        <div className="flex gap-3 bg-white p-1.5 rounded-xl shadow-sm">
          {/* Botão de Alternar Visualização na Tela */}
          <button 
            onClick={() => setActiveTab('RESUMO')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'RESUMO' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <FileText size={16} /> Ver Resumo
          </button>
          <button 
            onClick={() => setActiveTab('RECEITA')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${activeTab === 'RECEITA' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Pill size={16} /> Ver Receita
          </button>
        </div>

        <div className="flex gap-2">
          {/* BOTÕES DE IMPRESSÃO */}
          <button 
            onClick={() => handlePrint('RESUMO')}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-900 shadow-sm transition-colors"
          >
            <Printer size={18} /> Imprimir Resumo
          </button>
          
          <button 
            onClick={() => handlePrint('RECEITA')}
            disabled={!medicalRecord.prescription}
            className="bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Printer size={18} /> Imprimir Receita
          </button>
        </div>
      </div>

      {/* === DOCUMENTO A4 (Área de Impressão) === */}
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-xl shadow-sm print:shadow-none print:w-full print:max-w-none print:p-0 min-h-[29.7cm]">
        
        {/* CABEÇALHO (Igual para ambos) */}
        <div className="border-b-2 border-gray-800 pb-6 mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">{tenant.name}</h1>
            <p className="text-sm text-gray-500 mt-1">Medicina Veterinária & Bem-estar</p>
          </div>
          <div className="text-right text-sm text-gray-500 space-y-1">
             <p className="flex items-center justify-end gap-2"><MapPin size={14}/> Endereço da Clínica, 123</p>
             <p className="flex items-center justify-end gap-2"><Phone size={14}/> (00) 1234-5678</p>
          </div>
        </div>

        {/* DADOS DO PACIENTE (Igual para ambos) */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 text-sm print:bg-transparent print:border-gray-300">
          <div className="grid grid-cols-2 gap-y-2">
            <p><span className="font-bold text-gray-700">Protocolo:</span> #{data.appointmentId.slice(-6).toUpperCase()}</p>
            <p><span className="font-bold text-gray-700">Data:</span> {new Date(medicalRecord.date).toLocaleDateString('pt-BR')}</p>
            <div className="col-span-2 border-t border-gray-200 my-1"></div>
            <p><span className="font-bold text-gray-700">Tutor:</span> {pet.owner.name}</p>
            <p><span className="font-bold text-gray-700">Paciente:</span> {pet.name}</p>
            <p><span className="font-bold text-gray-700">Espécie:</span> {pet.species} • {pet.breed || 'SRD'}</p>
            <p><span className="font-bold text-gray-700">Idade/Peso:</span> {pet.birthDate ? new Date(pet.birthDate).toLocaleDateString() : 'N/A'} • {pet.weight ? `${pet.weight} kg` : '--'}</p>
          </div>
        </div>

        {/* === CONTEÚDO DINÂMICO === */}
        <div className="min-h-[400px]">
          
          {/* MODO: RESUMO CLÍNICO */}
          {activeTab === 'RESUMO' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-center text-lg font-bold uppercase text-gray-900 border-b border-gray-300 pb-2 mb-6">
                Relatório de Atendimento
              </h2>
              <div className="space-y-6 text-gray-800">
                <div>
                  <span className="font-bold text-gray-900 block mb-1 uppercase text-xs tracking-wider">Anamnese (Queixa):</span> 
                  <p className="text-sm leading-relaxed p-3 bg-gray-50 rounded border border-gray-100 print:bg-white print:border-none print:p-0">
                    {medicalRecord.complaint}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-gray-900 block mb-1 uppercase text-xs tracking-wider">Exame Físico / Obs:</span> 
                  <p className="text-sm leading-relaxed whitespace-pre-line p-3 bg-gray-50 rounded border border-gray-100 print:bg-white print:border-none print:p-0">
                    {medicalRecord.notes || "Sem alterações dignas de nota."}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-gray-900 block mb-1 uppercase text-xs tracking-wider">Diagnóstico:</span> 
                  <p className="text-sm font-bold p-3 bg-gray-50 rounded border border-gray-100 print:bg-white print:border-none print:p-0">
                    {medicalRecord.diagnosis || "Em investigação"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* MODO: RECEITUÁRIO */}
          {activeTab === 'RECEITA' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex items-center justify-center gap-2 mb-6 border-b border-gray-300 pb-2">
                 <Scissors className="text-gray-400 print:hidden" size={18} /> 
                 <h2 className="text-lg font-bold uppercase text-gray-900">Receituário Veterinário</h2>
              </div>
              
              {medicalRecord.prescription ? (
                <div className="whitespace-pre-wrap font-mono text-sm leading-loose text-gray-900 p-6 border border-gray-200 rounded bg-blue-50/30 print:bg-white print:border-none print:p-0">
                  {medicalRecord.prescription}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400 italic">
                  Nenhuma prescrição registrada neste atendimento.
                </div>
              )}
            </div>
          )}

        </div>

        {/* RODAPÉ / ASSINATURA */}
        <div className="mt-auto pt-16 flex justify-between items-end">
          <div className="text-xs text-gray-400">
            <p>Gerado em {new Date().toLocaleString('pt-BR')}</p>
            <p>VetManager • Documento Oficial</p>
          </div>

          <div className="text-center">
            <div className="border-t border-black w-64 mb-2 mx-auto"></div>
            <p className="font-bold text-gray-900">Dr(a). {veterinarian.name}</p>
            <p className="text-xs text-gray-500">Médico(a) Veterinário(a)</p>
          </div>
        </div>

      </div>

      {/* CSS GLOBAL PARA IMPRESSÃO */}
      <style>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          nav, aside, header, footer { display: none !important; }
          
          /* REMOVE A BARRA DE SCROLL NA IMPRESSÃO */
          ::-webkit-scrollbar { display: none !important; }
        }
      `}</style>
    </div>
  )
}