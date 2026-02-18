import type { NextAuthConfig } from "next-auth"

export default {
  secret: process.env.AUTH_SECRET,
  providers: [], // Os provedores reais são definidos no auth.ts para evitar dependências no Edge
} satisfies NextAuthConfig
