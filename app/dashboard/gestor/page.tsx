import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MetricCard from '@/components/ui/MetricCard'
import { DollarSign, MessageSquare, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function GestorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('id, nome, cargo')
    .eq('email', user.email)
    .single()

  // Clientes que esse gestor gerencia
  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nome, status, meta_account_id')
    .eq('gestor_id', perfil?.id)
    .eq('status', 'ativo')

  const clienteIds = clientes?.map(c => c.id) || []

  const dataInicio = new Date()
  dataInicio.setDate(dataInicio.getDate() - 30)
  const dataInicioStr = dataInicio.toISOString().split('T')[0]

  const { data: resultados } = clienteIds.length > 0 ? await supabase
    .from('resultados_campanha')
    .select('valor_gasto, leads_gerados')
    .in('cliente_id', clienteIds)
    .gte('data_referencia', dataInicioStr) : { data: [] }

  const { data: conversas } = clienteIds.length > 0 ? await supabase
    .from('conversas')
    .select('virou_venda, valor_venda')
    .in('cliente_id', clienteIds)
    .gte('data_conversa', dataInicioStr) : { data: [] }

  const totalGasto = (resultados ?? []).reduce((s: number, r) => s + (Number(r.valor_gasto) || 0), 0)
  const totalConversas = conversas?.length || 0
  const totalVendas = conversas?.filter(c => c.virou_venda).length || 0
  const cpl = totalConversas > 0 ? totalGasto / totalConversas : 0
  const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Meus Clientes
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Últimos 30 dias — {clientes?.length || 0} cliente{(clientes?.length || 0) !== 1 ? 's' : ''} ativo{(clientes?.length || 0) !== 1 ? 's' : ''}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <MetricCard label="Gasto total" value={fmtBRL(totalGasto)} icon={<DollarSign size={17} />} />
        <MetricCard label="Conversas" value={totalConversas} icon={<MessageSquare size={17} />} color="#3b82f6" />
        <MetricCard label="Vendas" value={totalVendas} icon={<TrendingUp size={17} />} color="#22c55e" />
        <MetricCard label="CPL médio" value={fmtBRL(cpl)} icon={<DollarSign size={17} />} color="#f59e0b" />
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {clientes?.map(cliente => (
          <Link key={cliente.id} href={`/dashboard/gestor/clientes/${cliente.id}`} style={{ textDecoration: 'none' }}>
            <div className="card card-hover" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px', fontFamily: 'Outfit, sans-serif' }}>
                  {cliente.nome}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {cliente.meta_account_id || 'Sem conta Meta'}
                </div>
              </div>
              <span style={{ fontSize: '13px', color: 'var(--accent)' }}>Ver →</span>
            </div>
          </Link>
        ))}
        {(!clientes || clientes.length === 0) && (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            Nenhum cliente atribuído a você ainda
          </div>
        )}
      </div>
    </div>
  )
}
