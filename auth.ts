import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/src/lib/db"
import authConfig from "./auth.config"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
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
    ...authConfig.providers,
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

        if (!user || !user.password) return null

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          tenantSlug: user.tenant.slug,
          plan: user.tenant.plan,
          modules: user.tenant.modules.map(m => m.moduleId)
        }
      }
    }
  ]
})
