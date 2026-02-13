import { db } from "@/src/lib/db"
import { Package, AlertTriangle, Search, Trash2, CalendarClock } from "lucide-react"
import { ProductModal } from "./product-modal"
import { deleteProduct } from "@/src/actions/estoque"

interface PageProps {
  params: Promise<{ tenantId: string }>
  searchParams: Promise<{ q?: string }>
}

export default async function EstoquePage({ params, searchParams }: PageProps) {
  const { tenantId } = await params
  const { q } = await searchParams

  // Buscar Produtos
  const products = await db.product.findMany({
    where: {
      tenant: { slug: tenantId },
      name: q ? { contains: q, mode: 'insensitive' } : undefined
    },
    orderBy: { name: 'asc' }
  })

  // Formatador de Moeda
  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="max-w-6xl mx-auto">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-emerald-600" /> Estoque & Farmácia
          </h1>
          <p className="text-gray-500 text-sm">Controle de medicamentos, vacinas e insumos.</p>
        </div>
        <ProductModal tenantSlug={tenantId} />
      </div>

      {/* Barra de Busca */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
        <form className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            name="q"
            defaultValue={q}
            placeholder="Buscar medicamento ou insumo..." 
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg outline-emerald-500 text-sm"
          />
        </form>
      </div>

      {/* Tabela */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Produto</th>
              <th className="px-6 py-4 text-center">Unidade</th>
              <th className="px-6 py-4 text-center">Estoque</th>
              <th className="px-6 py-4 text-right">Preço Venda</th>
              <th className="px-6 py-4 text-center">Validade</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.length === 0 ? (
               <tr>
                 <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                   Nenhum produto cadastrado.
                 </td>
               </tr>
            ) : (
              products.map((product) => {
                // Lógica de Status
                const isLowStock = product.quantity <= product.minStock
                const isExpired = product.expiryDate && new Date(product.expiryDate) < new Date()
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{product.name}</p>
                      {isLowStock && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold uppercase inline-flex items-center gap-1 mt-1">
                          <AlertTriangle size={10} /> Estoque Baixo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">
                        {product.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-lg font-bold ${isLowStock ? 'text-red-600' : 'text-gray-800'}`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-600">
                      {BRL.format(Number(product.price))}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.expiryDate ? (
                        <div className={`text-xs flex items-center justify-center gap-1 ${isExpired ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                          <CalendarClock size={14} />
                          {new Date(product.expiryDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <form action={async () => {
                        "use server"
                        await deleteProduct(product.id, tenantId)
                      }}>
                        <button 
                          className="text-gray-300 hover:text-red-500 p-2 transition-colors"
                          title="Excluir Produto"
                        >
                          <Trash2 size={18} />
                        </button>
                      </form>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}