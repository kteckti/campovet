import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

export default {
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      async authorize(credentials) {
        // A lógica real de autorização fica no auth.ts (Node.js runtime)
        return null
      },
    }),
  ],
} satisfies NextAuthConfig
