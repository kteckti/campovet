import { 
  Dog, 
  Stethoscope, 
  Milk, 
  Beef, 
  Syringe, 
  Activity,
  LayoutDashboard,
  UserCheck,
  ClipboardList
} from "lucide-react"

// Define como cada módulo aparece no menu
export const MODULE_DEFINITIONS: Record<string, { label: string; icon: any; href: string }> = {
  mod_creche: { 
    label: "Creche & Hotel", 
    icon: Dog, 
    href: "/creche/baias" 
  },
  mod_clinica: { 
    label: "Clínica Vet", 
    icon: Stethoscope, 
    href: "/clinica" 
  },
  mod_pet_sitter: { 
    label: "Pet Sitter", 
    icon: UserCheck, 
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
    label: "Reprodução Equina", 
    icon: ClipboardList, 
    href: "/equinos" 
  },
}

// Menu padrão que sempre aparece (Dashboard)
export const DEFAULT_MENU = [
  { label: "Visão Geral", icon: LayoutDashboard, href: "/dashboard" }
]
