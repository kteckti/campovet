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
    console.log('🔍 Middleware - Módulos:', user?.modules)
    console.log('🔍 Middleware - Plano:', user?.plan)
    console.log('🔍 Middleware - URL:', nextUrl.pathname)
  }
  
  // 1. Permitir acesso a rotas públicas
  const isPublicRoute = nextUrl.pathname === "/" || nextUrl.pathname === "/login" || nextUrl.pathname === "/register"
  
  // Se estiver logado e tentar acessar a raiz, o login/page ou dashboard cuidará do redirecionamento
  if (isPublicRoute) return NextResponse.next()

  // 2. Redirecionar para login se não estiver autenticado
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // 3. Validação de Módulos (Ex: /clinica-silva/pet-sitter/...)
  const pathParts = nextUrl.pathname.split("/").filter(Boolean) // Remove partes vazias
  
  // Se a URL tem pelo menos 2 partes: [tenantSlug, module, ...]
  if (pathParts.length >= 2) {
    const tenantSlug = pathParts[0]
    const requestedModule = pathParts[1]
    
    // Módulos que NÃO precisam de validação (rotas administrativas e padrão)
    const exemptRoutes = ['dashboard', 'servicos', 'financeiro', 'configuracoes']
    
    // Se for uma rota isenta, permite acesso
    if (exemptRoutes.includes(requestedModule)) {
      return NextResponse.next()
    }
    
    // Mapeamento de rotas para IDs de módulos
    const moduleMapping: Record<string, string> = {
      "pet-sitter": "mod_pet_sitter",
      "creche": "mod_creche",
      "clinica": "mod_clinica",
      "equinos": "mod_equinos",
      "gado-leite": "mod_leite",
      "gado-corte": "mod_corte"
    }

    const moduleId = moduleMapping[requestedModule]
    
    // Se a rota corresponde a um módulo que precisa de validação
    if (moduleId) {
      const userModules = user?.modules || []
      const userPlan = user?.plan
      
      // Debug: Log da validação
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Validando módulo:', moduleId)
        console.log('🔍 Módulos do usuário:', userModules)
        console.log('🔍 Plano premium?', userPlan?.isPremium)
      }
      
      // IMPORTANTE: Se os dados da sessão não estiverem disponíveis, permite acesso
      // Isso evita redirecionamentos indesejados durante a inicialização da sessão
      if (!userModules || userModules.length === 0) {
        console.warn('⚠️ Middleware - Dados de módulos não disponíveis na sessão, permitindo acesso')
        return NextResponse.next()
      }
      
      const hasAccess = userPlan?.isPremium || userModules.includes(moduleId)
      
      if (!hasAccess) {
        console.log('❌ Acesso negado ao módulo:', moduleId)
        // Se não tem acesso, manda para o dashboard principal do tenant
        const redirectUrl = `/${tenantSlug}/dashboard`
        console.log('🔄 Redirecionando para:', redirectUrl)
        return NextResponse.redirect(new URL(redirectUrl, nextUrl))
      }
      
      console.log('✅ Acesso permitido ao módulo:', moduleId)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
