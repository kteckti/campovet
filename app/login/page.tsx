"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { getMyTenantSlug } from "@/src/lib/actions/auth-actions"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email ou senha inválidos")
      } else {
        // Busca o slug da clínica do usuário para redirecionar
        const tenantSlug = await getMyTenantSlug()
        
        if (tenantSlug) {
          router.push(`/${tenantSlug}/dashboard`)
        } else {
          router.push("/")
        }
        router.refresh()
      }
    } catch (err) {
      setError("Ocorreu um erro ao tentar entrar")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-indigo-200">
              C
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h1>
            <p className="text-gray-500 mt-2">Entre com suas credenciais para acessar a plataforma</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-12 py-4 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="exemplo@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-gray-700">Senha</label>
                <Link href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Esqueceu a senha?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-12 py-4 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>Entrar <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-gray-500 text-sm">
              Não tem uma conta?{" "}
              <Link href="/register" className="text-indigo-600 font-bold hover:text-indigo-700">Criar agora</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
