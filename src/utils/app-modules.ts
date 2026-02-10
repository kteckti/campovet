import { 
  Dog, 
  Stethoscope, 
  Milk, 
  Beef, 
  Syringe, 
  Activity,
  LayoutDashboard 
} from "lucide-react"

// Define como cada módulo aparece no menu
export const MODULE_DEFINITIONS: Record<string, { label: string; icon: any; href: string }> = {
  // Módulos do Banco de Dados
  mod_creche: { 
    label: "Creche & Hotel", 
    icon: Dog, 
    // Mudei aqui: em vez de ir para /creche (que não existe), vai para /creche/tutores
    href: "/creche/baias" 
  },
  mod_clinica: { 
    label: "Clínica Vet", 
    icon: Stethoscope, 
    href: "/clinica" 
  },
  mod_pet_sitter: { 
    label: "Pet Sitter", 
    icon: Activity, 
    href: "/pet-sitter" 
  },
  mod_leite: { 
    label: "Gado Leiteiro", 
    icon: Milk, 
    href: "/gado-leite" 
  },
  mod_corte: { 
    label: "Gado de Corte", 
    icon: Beef, 
    href: "/gado-corte" 
  },
  mod_equinos: { 
    label: "Equinos", 
    icon: Activity, 
    href: "/equinos" 
  },
  // Adicione outros conforme necessário
}

// Menu padrão que sempre aparece (Dashboard)
export const DEFAULT_MENU = [
  { label: "Visão Geral", icon: LayoutDashboard, href: "/dashboard" }
]