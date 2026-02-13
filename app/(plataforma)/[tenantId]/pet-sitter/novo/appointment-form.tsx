"use client"

import { useState, useEffect } from "react"
import { createPetSitterAppointment } from "@/src/actions/pet-sitter"
import { useRouter } from "next/navigation"
import { Calendar, DollarSign, MapPin, Repeat } from "lucide-react"

interface Pet {
  id: string
  name: string
  owner: {
    id: string
    name: string
    address?: string | null
  }
}

interface Service {
  id: string
  name: string
  price: number
}

interface AppointmentFormProps {
  tenantId: string
  pets: Pet[]
  services: Service[]
}

export function AppointmentForm({ tenantId, pets, services }: AppointmentFormProps) {
  const router = useRouter()
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [distanceKm, setDistanceKm] = useState<string>("")
  const [isRecurring, setIsRecurring] = useState(false)
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)

  // Calcular valores
  const fuelCostPerKm = 6.00 / 10 // R$ 0,60 por km (R$ 6,00/litro, 10km/litro)
  const distance = distanceKm ? parseFloat(distanceKm) : 0
  const fuelCost = distance * fuelCostPerKm
  const totalCost = (selectedService?.price || 0) + fuelCost

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    // Adicionar padrão de recorrência se aplicável
    if (isRecurring && selectedDays.length > 0) {
      const pattern = `WEEKLY_${selectedDays.join("_")}`
      formData.set("recurrencePattern", pattern)
    }
    
    await createPetSitterAppointment(tenantId, formData)
    router.push(`/${tenantId}/pet-sitter`)
  }

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  const daysOfWeek = [
    { value: "SUN", label: "Dom" },
    { value: "MON", label: "Seg" },
    { value: "TUE", label: "Ter" },
    { value: "WED", label: "Qua" },
    { value: "THU", label: "Qui" },
    { value: "FRI", label: "Sex" },
    { value: "SAT", label: "Sáb" }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Seleção de Pet */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pet *
        </label>
        <select 
          name="petId"
          required
          onChange={(e) => {
            const pet = pets.find(p => p.id === e.target.value)
            setSelectedPet(pet || null)
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Selecione um pet</option>
          {pets.map(pet => (
            <option key={pet.id} value={pet.id}>
              {pet.name} ({pet.owner.name})
            </option>
          ))}
        </select>
      </div>

      {/* Seleção de Serviço */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Serviço *
        </label>
        <select 
          name="serviceId"
          required
          onChange={(e) => {
            const service = services.find(s => s.id === e.target.value)
            setSelectedService(service || null)
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Selecione um serviço</option>
          {services.map(service => (
            <option key={service.id} value={service.id}>
              {service.name} - R$ {service.price.toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      {/* Data e Horário */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar size={16} />
            Data da Visita *
          </label>
          <input 
            type="date" 
            name="date"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Horário Previsto *
          </label>
          <input 
            type="time" 
            name="time"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Endereço e Distância */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <MapPin size={18} className="text-blue-600" />
          Informações de Localização
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Endereço de Atendimento
          </label>
          <input 
            type="text" 
            name="address"
            defaultValue={selectedPet?.owner.address || ""}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ex: Rua das Flores, 123 - Apto 42"
          />
          <p className="text-xs text-gray-500 mt-1">
            Deixe em branco para usar o endereço cadastrado do tutor
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Distância (KM) *
          </label>
          <input 
            type="number" 
            name="distanceKm"
            step="0.1"
            min="0"
            required
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0.0"
          />
          <p className="text-xs text-gray-500 mt-1">
            Distância do local de partida até o cliente (usado para calcular combustível)
          </p>
        </div>
      </div>

      {/* Recorrência */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            id="isRecurring"
            name="isRecurring"
            value="true"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
          />
          <label htmlFor="isRecurring" className="font-semibold text-gray-800 flex items-center gap-2">
            <Repeat size={18} className="text-purple-600" />
            Visita Recorrente
          </label>
        </div>

        {isRecurring && (
          <div className="space-y-4 pl-7">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dias da Semana
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedDays.includes(day.value)
                        ? "bg-indigo-600 text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Final da Recorrência *
              </label>
              <input 
                type="date" 
                name="recurrenceEndDate"
                required={isRecurring}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Até quando as visitas devem se repetir
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Observações */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observações e Instruções
        </label>
        <textarea 
          name="notes"
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Instruções sobre alimentação, chaves, comportamento..."
        />
      </div>

      {/* Resumo Financeiro */}
      {selectedService && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
            <DollarSign size={18} className="text-green-600" />
            Resumo Financeiro
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Valor do Serviço:</span>
              <span className="font-medium">R$ {selectedService.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Custo de Combustível ({distance.toFixed(1)} km):</span>
              <span className="font-medium">R$ {fuelCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-green-300">
              <span className="text-gray-800 font-semibold">Total por Visita:</span>
              <span className="font-bold text-lg text-green-700">R$ {totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-4 pt-4">
        <button 
          type="submit"
          className="flex-1 bg-indigo-600 text-white font-medium py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Confirmar Agendamento
        </button>
        <button 
          type="button"
          onClick={() => router.push(`/${tenantId}/pet-sitter`)}
          className="flex-1 bg-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
