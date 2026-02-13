interface PageProps {
  params: Promise<{ tenantId: string }>
}

export default async function NovoPetSitterPage({ params }: PageProps) {
  const { tenantId } = await params

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Novo Agendamento - {tenantId}</h1>
      <p>Teste de rota para novo agendamento.</p>
    </div>
  )
}
