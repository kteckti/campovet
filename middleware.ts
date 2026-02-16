import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req
  const user = req.auth?.user as any
  
  // Debug: Log para verificar dados da sessão
  if (isLoggedIn && process.env.NODE_ENV === 'development') {
    console.log('🔍 Middleware - Usuário:', user?.email)
    console.log('🔍 Middleware - URL:', nextUrl.pathname)
  }
  
  // 1. Permitir acesso a rotas públicas
  const isPublicRoute = 
    nextUrl.pathname === "/" || 
    nextUrl.pathname === "/login" || 
    nextUrl.pathname === "/register" ||
    nextUrl.pathname === "/debug-session"
  
  if (isPublicRoute) return NextResponse.next()

  // 2. Redirecionar para login se não estiver autenticado
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // 3. Proteção da rota /admin (SuperAdmin)
  if (nextUrl.pathname.startsWith("/admin")) {
    if (user?.email !== "kteckti@gmail.com") {
      // Se não for o admin central, redireciona para o dashboard dele
      return NextResponse.redirect(new URL("/", nextUrl))
    }
    return NextResponse.next()
  }

  // 4. Validação de Módulos (Ex: /clinica-silva/pet-sitter/...)
  const pathParts = nextUrl.pathname.split("/").filter(Boolean)
  
  if (pathParts.length >= 2) {
    const tenantSlug = pathParts[0]
    const requestedModule = pathParts[1]
    
    const exemptRoutes = ['dashboard', 'servicos', 'financeiro', 'configuracoes', 'pagamento']
    
    if (exemptRoutes.includes(requestedModule)) {
      return NextResponse.next()
    }
    
    const moduleMapping: Record<string, string> = {
      "pet-sitter": "mod_pet_sitter",
      "creche": "mod_creche",
      "clinica": "mod_clinica",
      "equinos": "mod_equinos",
      "gado-leite": "mod_leite",
      "gado-corte": "mod_corte"
    }

    const moduleId = moduleMapping[requestedModule]
    
    if (moduleId) {
      const userModules = user?.modules || []
      const userPlan = user?.plan
      
      if (!userModules || userModules.length === 0) {
        return NextResponse.next()
      }
      
      const hasAccess = userPlan?.isPremium || userModules.includes(moduleId)
      
      if (!hasAccess) {
        const redirectUrl = `/${tenantSlug}/dashboard`
        return NextResponse.redirect(new URL(redirectUrl, nextUrl))
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
