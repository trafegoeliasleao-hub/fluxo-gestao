import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MetricCard from '@/components/ui/MetricCard'
import { DollarSign, MessageSquare, TrendingUp, Target } from 'lucide-react'
import Link from 'next/link'

export default async function ClienteHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Busca o cliente vinculado ao usuário
  const { data: usuarioDB } = await supabase
    .from('usuarios')
    .select('id, nome, cargo')
    .eq('email', user.email)
    .single()

  // Se for cliente, busca a conta de cliente vinculada pelo email
  const { data: cliente } = await supabase
    .from('clientes')
    .select('*')
    .eq('email', user.email)
    .single()

  if (!cliente) {
    return (
      <div style={{ padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Conta não vinculada
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Seu acesso ainda não foi vinculado a um cliente. Entre em contato com o gestor.
          </p>
        </div>
      </div>
    )
  }

  // Últimos 30 dias
  const dataInicio = new Date()
  dataInicio.setDate(dataInicio.getDate() - 30)
  const dataInicioStr = dataInicio.toISOString().split('T')[0]

  const { data: resultados } = await supabase
    .from('resultados_campanha')
    .select('*')
    .eq('cliente_id', cliente.id)
    .gte('data_referencia', dataInicioStr)
    .order('data_referencia', { ascending: false })

  const { data: conversas } = await supabase
    .from('conversas')
    .select('*')
    .eq('cliente_id', cliente.id)
    .gte('data_conversa', dataInicioStr)
    .order('data_conversa', { ascending: false })

  // Campanhas únicas ativas (com gasto nos últimos 7 dias)
  const data7dias = new Date()
  data7dias.setDate(data7dias.getDate() - 7)
  const data7diasStr = data7dias.toISOString().split('T')[0]

  const campanhasAtivas = resultados
    ? [...new Map(
        resultados
          .filter(r => r.data_referencia >= data7diasStr && r.valor_gasto > 0)
          .map(r => [r.meta_campanha_id, r])
      ).values()]
    : []

  // Métricas
  const totalGasto = resultados?.reduce((s, r) => s + (r.valor_gasto || 0), 0) || 0
  const totalConversas = conversas?.length || 0
  const totalVendas = conversas?.filter(c => c.virou_venda).length || 0
  const cpl = totalConversas > 0 ? totalGasto / totalConversas : 0
  const pendentes = conversas?.filter(c => c.status_registro === 'pendente').length || 0

  const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Olá, {cliente.nome} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Resultados dos últimos 30 dias
        </p>
      </div>

      {/* Alerta de pendentes */}
      {pendentes > 0 && (
        <Link href="/dashboard/cliente/conversas" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '14px 18px', borderRadius: '10px', marginBottom: '24px',
            background: 'rgba(20, 184, 166, 0.1)', border: '1px solid rgba(20, 184, 166, 0.3)',
            cursor: 'pointer', transition: 'opacity 0.2s'
          }}>
            <MessageSquare size={16} color="var(--accent)" />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: 600 }}>
                {pendentes} conversa{pendentes > 1 ? 's' : ''} aguardando seu preenchimento
              </span>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Clique para informar quais viraram venda
              </p>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--accent)' }}>Preencher →</span>
          </div>
        </Link>
      )}

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <MetricCard label="Investimento" value={fmtBRL(totalGasto)} icon={<DollarSign size={17} />} />
        <MetricCard label="Conversas geradas" value={totalConversas} icon={<MessageSquare size={17} />} color="#3b82f6" />
        <MetricCard label="Vendas fechadas" value={totalVendas} icon={<TrendingUp size={17} />} color="#22c55e" />
        <MetricCard label="Custo por conversa" value={fmtBRL(cpl)} icon={<Target size={17} />} color="#f59e0b" />
      </div>

      {/* Campanhas ativas */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
            Campanhas ativas (últimos 7 dias)
          </h2>
          <Link href="/dashboard/cliente/campanhas" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            Ver todas →
          </Link>
        </div>
        <div style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Campanha', 'Gasto', 'Conversas', 'CPL', 'Impressões'].map(h => (
                  <th key={h} style={{
                    padding: '12px 24px', textAlign: 'left',
                    fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)',
                    letterSpacing: '0.05em', textTransform: 'uppercase'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campanhasAtivas.map((r) => {
                const gastocamp = resultados?.filter(x => x.meta_campanha_id === r.meta_campanha_id).reduce((s, x) => s + (x.valor_gasto || 0), 0) || 0
                const convscamp = resultados?.filter(x => x.meta_campanha_id === r.meta_campanha_id).reduce((s, x) => s + (x.leads_gerados || 0), 0) || 0
                const impscamp = resultados?.filter(x => x.meta_campanha_id === r.meta_campanha_id).reduce((s, x) => s + (x.impressoes || 0), 0) || 0
                const cplcamp = convscamp > 0 ? gastocamp / convscamp : 0

                return (
                  <tr key={r.meta_campanha_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border-subtle)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 24px', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', maxWidth: '280px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.nome_campanha || r.meta_campanha_id}
                      </div>
                    </td>
                    <td style={{ padding: '14px 24px', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {fmtBRL(gastocamp)}
                    </td>
                    <td style={{ padding: '14px 24px', fontSize: '13px', color: 'var(--text-primary)' }}>
                      {convscamp}
                    </td>
                    <td style={{ padding: '14px 24px', fontSize: '13px', color: convscamp > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                      {convscamp > 0 ? fmtBRL(cplcamp) : '—'}
                    </td>
                    <td style={{ padding: '14px 24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {impscamp.toLocaleString('pt-BR')}
                    </td>
                  </tr>
                )
              })}
              {campanhasAtivas.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                    Nenhuma campanha com dados nos últimos 7 dias
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
