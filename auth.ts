import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/src/lib/db"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
          include: { tenant: { include: { plan: true, modules: true } } }
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
    })
  ],
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
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.sub
        (session.user as any).role = token.role
        (session.user as any).tenantId = token.tenantId
        (session.user as any).tenantSlug = token.tenantSlug
        (session.user as any).plan = token.plan
        (session.user as any).modules = token.modules
      }
      return session
    }
  }
})
