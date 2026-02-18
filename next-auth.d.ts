import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      tenantId: string
      tenantSlug: string
      plan?: {
        id: string
        name: string
        price: number
        isPremium: boolean
      }
      modules?: string[]
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    tenantId: string
    tenantSlug: string
    plan?: {
      id: string
      name: string
      price: number
      isPremium: boolean
    }
    modules?: string[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    tenantId: string
    tenantSlug: string
    plan?: {
      id: string
      name: string
      price: number
      isPremium: boolean
    }
    modules?: string[]
  }
}
