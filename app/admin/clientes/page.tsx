import { getAllTenants } from "@/src/lib/actions/admin-actions"
import { ClientActions } from "./client-actions"
import { Shield, Users, Calendar, Key } from "lucide-react"

export default async function AdminClientesPage() {
  const tenants = await getAllTenants()

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Clientes</h1>
          <p className="text-gray-500 mt-1">Gerencie clínicas, libere acessos e resete senhas.</p>
        </div>
        <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100 flex items-center gap-2">
          <Users size={18} />
          {tenants.length} Clientes Cadastrados
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {tenants.map((tenant) => {
          const adminUser = tenant.users[0]
          const isExpired = tenant.trialEndsAt ? new Date(tenant.trialEndsAt) < new Date() : false
          
          return (
            <div key={tenant.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-900">{tenant.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      tenant.subscriptionStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                      tenant.subscriptionStatus === 'TRIAL' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {tenant.subscriptionStatus}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-4">
                    <span className="flex items-center gap-1"><Shield size={14} /> {tenant.plan?.name || 'Sem Plano'}</span>
                    <span className="flex items-center gap-1"><Calendar size={14} /> Expira em: {tenant.trialEndsAt ? new Date(tenant.trialEndsAt).toLocaleDateString('pt-BR') : 'N/A'}</span>
                  </div>
                  <div className="text-xs text-gray-400">Slug: {tenant.slug} | Doc: {tenant.document || 'N/A'}</div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-1 min-w-[250px]">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Responsável</div>
                  <div className="text-sm font-bold text-gray-900">{adminUser?.name || 'N/A'}</div>
                  <div className="text-xs text-gray-500">{adminUser?.email}</div>
                  <div className="text-xs text-gray-500">{adminUser?.phone || 'Sem telefone'}</div>
                </div>

                <div className="flex items-center gap-3">
                  <ClientActions 
                    tenantId={tenant.id} 
                    tenantName={tenant.name}
                    adminUserId={adminUser?.id}
                    adminEmail={adminUser?.email}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
