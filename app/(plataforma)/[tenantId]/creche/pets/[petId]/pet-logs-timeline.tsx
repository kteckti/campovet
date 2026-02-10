"use client"

import { useState } from "react"
import { Activity, FileText, Pill, Utensils, ChevronDown, Loader2 } from "lucide-react"
import { getMorePetLogs } from "@/src/actions/creche"

interface Log {
  id: string
  type: string
  description: string
  performedBy: string | null
  date: Date
}

interface PetLogsTimelineProps {
  initialLogs: Log[]
  petId: string
}

export function PetLogsTimeline({ initialLogs, petId }: PetLogsTimelineProps) {
  const [logs, setLogs] = useState<Log[]>(initialLogs)
  const [offset, setOffset] = useState(5) // Já começamos mostrando 5
  const [hasMore, setHasMore] = useState(initialLogs.length >= 5) // Se veio menos de 5, não tem mais
  const [isLoading, setIsLoading] = useState(false)

  const loadMore = async () => {
    setIsLoading(true)
    try {
      const newLogs = await getMorePetLogs(petId, offset)
      
      if (newLogs.length < 5) {
        setHasMore(false) // Acabaram os registros
      }
      
      setLogs((prev) => [...prev, ...newLogs])
      setOffset((prev) => prev + 5)
    } catch (error) {
      console.error("Erro ao carregar logs", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
      
      {logs.length === 0 ? (
        <p className="text-center text-gray-400 py-10">Nenhum registro ainda.</p>
      ) : (
        logs.map((log) => (
          <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            
            {/* Ícone do Log */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 group-[.is-active]:bg-white text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              {log.type === 'FOOD' && <Utensils size={16} className="text-orange-500" />}
              {log.type === 'MEDICINE' && <Pill size={16} className="text-blue-500" />}
              {log.type === 'EXERCISE' && <Activity size={16} className="text-green-500" />}
              {log.type === 'OBSERVATION' && <FileText size={16} className="text-gray-500" />}
            </div>

            {/* Conteúdo do Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
              
              {/* Cabeçalho do Card */}
              <div className="flex items-center justify-between space-x-2 mb-2 pb-2 border-b border-gray-50">
                <span className={`font-bold text-xs px-2 py-0.5 rounded uppercase tracking-wide
                  ${log.type === 'FOOD' ? 'bg-orange-100 text-orange-700' :
                    log.type === 'MEDICINE' ? 'bg-blue-100 text-blue-700' :
                      log.type === 'EXERCISE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                `}>
                  {log.type === 'FOOD' ? 'Alimentação' :
                    log.type === 'MEDICINE' ? 'Medicação' :
                      log.type === 'EXERCISE' ? 'Atividade' : 'Observação'}
                </span>
                <time className="font-medium text-xs text-slate-400">
                  {new Date(log.date).toLocaleDateString('pt-BR')} às {new Date(log.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </time>
              </div>

              {/* Descrição */}
              <div className="text-slate-700 text-sm mb-2 font-medium">
                {log.description}
              </div>

              {/* Rodapé: Quem fez */}
              {log.performedBy && (
                <div className="text-xs text-slate-400 flex items-center gap-1 mt-2 pt-2 border-t border-dashed border-gray-100">
                  <span className="font-semibold text-slate-500">Responsável:</span> {log.performedBy}
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {/* Botão Ler Mais */}
      {hasMore && (
        <div className="flex justify-center pt-4 pb-2 relative z-20">
          <button 
            onClick={loadMore}
            disabled={isLoading}
            className="bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900 px-6 py-2 rounded-full text-sm font-medium shadow-sm flex items-center gap-2 transition-all disabled:opacity-70"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
            {isLoading ? "Carregando..." : "Ler mais mensagens"}
          </button>
        </div>
      )}
    </div>
  )
}