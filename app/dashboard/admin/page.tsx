'use client'
import { createClient } from '@/lib/supabase/server'
import { DollarSign, Users, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react'
import MetricCard from '@/components/ui/MetricCard'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Busca clientes ativos
  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nome, status, meta_account_id')
    .eq('status', 'ativo')
    .order('nome')

  // Busca resultados dos últimos 30 dias
  const dataInicio = new Date()
  dataInicio.setDate(dataInicio.getDate() - 30)
  const dataInicioStr = dataInicio.toISOString().split('T')[0]

  const { data: resultados } = await supabase
    .from('resultados_campanha')
    .select('valor_gasto, leads_gerados, impressoes, alcance, cliques')
    .gte('data_referencia', dataInicioStr)

  const { data: conversas } = await supabase
    .from('conversas')
    .select('id, virou_venda, valor_venda, status_registro')
    .gte('data_conversa', dataInicioStr)

  // Cálculos
  const totalGasto = resultados?.reduce((s, r) => s + (r.valor_gasto || 0), 0) || 0
  const totalConversas = conversas?.length || 0
  const totalVendas = conversas?.filter(c => c.virou_venda).length || 0
  const receitaTotal = conversas?.filter(c => c.virou_venda).reduce((s, c) => s + (c.valor_venda || 0), 0) || 0
  const pendentes = conversas?.filter(c => c.status_registro === 'pendente').length || 0
  const cpl = totalConversas > 0 ? totalGasto / totalConversas : 0

  const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })

  return (
    <div style={{ padding: '32px', maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Visão Geral
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Últimos 30 dias — todos os clientes
        </p>
      </div>

      {/* Alerta de pendentes */}
      {pendentes > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 16px', borderRadius: '10px', marginBottom: '24px',
          background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)'
        }}>
          <AlertCircle size={16} color="var(--warning)" />
          <span style={{ fontSize: '13px', color: 'var(--warning)', fontWeight: 500 }}>
            {pendentes} conversa{pendentes > 1 ? 's' : ''} aguardando preenchimento dos clientes
          </span>
        </div>
      )}

      {/* Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <MetricCard
          label="Gasto total"
          value={fmtBRL(totalGasto)}
          icon={<DollarSign size={17} />}
        />
        <MetricCard
          label="Conversas geradas"
          value={totalConversas}
          icon={<MessageSquare size={17} />}
          color="#3b82f6"
        />
        <MetricCard
          label="Vendas fechadas"
          value={totalVendas}
          icon={<TrendingUp size={17} />}
          color="#22c55e"
        />
        <MetricCard
          label="CPL médio"
          value={fmtBRL(cpl)}
          icon={<DollarSign size={17} />}
          color="#f59e0b"
        />
        <MetricCard
          label="Receita rastreada"
          value={fmtBRL(receitaTotal)}
          icon={<DollarSign size={17} />}
          color="#8b5cf6"
        />
        <MetricCard
          label="Clientes ativos"
          value={clientes?.length || 0}
          icon={<Users size={17} />}
          color="#06b6d4"
        />
      </div>

      {/* Lista de clientes */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
            Clientes ativos
          </h2>
          <Link href="/dashboard/admin/clientes" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            Ver todos →
          </Link>
        </div>

        <div style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Cliente', 'Conta Meta', 'Status', 'Ação'].map(h => (
                  <th key={h} style={{
                    padding: '12px 24px', textAlign: 'left',
                    fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)',
                    letterSpacing: '0.05em', textTransform: 'uppercase'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clientes?.map((cliente) => (
                <tr key={cliente.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border-subtle)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {cliente.nome}
                    </span>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {cliente.meta_account_id || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <span className="badge badge-success">Ativo</span>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <Link
                      href={`/dashboard/admin/clientes/${cliente.id}`}
                      style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
                    >
                      Ver detalhes
                    </Link>
                  </td>
                </tr>
              ))}
              {(!clientes || clientes.length === 0) && (
                <tr>
                  <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                    Nenhum cliente ativo encontrado
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
