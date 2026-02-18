import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/src/lib/db"
import authConfig from "./auth.config"
import bcrypt from "bcryptjs"
// Importação do tipo Adapter para corrigir o erro anterior
import type { Adapter } from "next-auth/adapters"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db) as Adapter,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.tenantId = (user as any).tenantId
        token.tenantSlug = (user as any).tenantSlug
        token.plan = (user as any).plan 
        token.modules = (user as any).modules
      }
      return token
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.sub
        session.user.role = token.role
        session.user.tenantId = token.tenantId
        session.user.tenantSlug = token.tenantSlug
        session.user.plan = token.plan
        session.user.modules = token.modules
      }
      return session
    }
  },
  ...authConfig,
  providers: [
    {
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
          include: { 
            tenant: { 
              include: { 
                plan: true, 
                modules: true 
              } 
            } 
          }
        })

        if (!user) {
          return null
        }

        if (!user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        // --- CORREÇÃO AQUI ---
        // Prepara o objeto do plano convertendo Decimal para Number e tratando null/undefined
        let planFormatted = undefined;
        
        if (user.tenant.plan) {
          planFormatted = {
            id: user.tenant.plan.id,
            name: user.tenant.plan.name,
            // O Prisma retorna Decimal, o NextAuth precisa de Number
            price: Number(user.tenant.plan.price), 
            isPremium: user.tenant.plan.isPremium
          };
        }

        // Retornar objeto limpo e tipado corretamente
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          tenantSlug: user.tenant.slug,
          plan: planFormatted, // Agora envia o objeto formatado ou undefined
          modules: user.tenant.modules.map(m => m.moduleId)
        }
      }
    }
  ]
})