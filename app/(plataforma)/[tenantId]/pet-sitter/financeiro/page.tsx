interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function FinanceiroPetSitterPage({ params }: PageProps) {
  const { tenantId } = await params

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Financeiro Pet Sitter - {tenantId}</h1>
      <p>Teste de rota para financeiro.</p>
    </div>
  )
}
