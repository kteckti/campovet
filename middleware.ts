import { auth } from "./auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req
  
  // 1. Permitir acesso a rotas públicas
  const isPublicRoute = nextUrl.pathname === "/" || nextUrl.pathname === "/login" || nextUrl.pathname === "/register"
  if (isPublicRoute) return NextResponse.next()

  // 2. Redirecionar para login se não estiver autenticado
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // 3. Validação de Módulos (Ex: /clinica-silva/pet-sitter/...)
  const pathParts = nextUrl.pathname.split("/")
  // pathParts[1] = tenantSlug, pathParts[2] = moduleName
  
  if (pathParts.length >= 3) {
    const userModules = (req.auth?.user as any)?.modules || []
    const userPlan = (req.auth?.user as any)?.plan
    const requestedModule = pathParts[2]
    
    // Mapeamento de rotas para IDs de módulos
    const moduleMapping: Record<string, string> = {
      "pet-sitter": "mod_pet_sitter",
      "creche": "mod_creche",
      "clinica": "mod_clinica",
      "equinos": "mod_equinos",
      "leite": "mod_leite",
      "corte": "mod_corte"
    }

    const moduleId = moduleMapping[requestedModule]
    
    if (moduleId) {
      const hasAccess = userPlan?.isPremium || userModules.includes(moduleId)
      
      if (!hasAccess) {
        // Redirecionar para dashboard se não tiver acesso ao módulo
        return NextResponse.redirect(new URL("/dashboard/modules?error=unauthorized", nextUrl))
      }
    }
  }

  // 4. Validação de Inadimplência (Past Due)
  const subscriptionStatus = (req.auth?.user as any)?.tenant?.subscriptionStatus
  if (subscriptionStatus === "PAST_DUE" && !nextUrl.pathname.includes("/billing")) {
    // Permitir apenas acesso à página de faturamento se estiver atrasado
    // return NextResponse.redirect(new URL("/billing", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
