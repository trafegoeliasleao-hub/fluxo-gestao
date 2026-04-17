import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

export default async function ClientesPage() {
  const supabase = await createClient()

  const { data: clientes } = await supabase
    .from('clientes')
    .select('*')
    .order('nome')

  const statusColors: Record<string, string> = {
    ativo: 'badge-success',
    pausado: 'badge-warning',
    encerrado: 'badge-error',
    prospecto: 'badge-info',
  }

  const statusLabels: Record<string, string> = {
    ativo: 'Ativo',
    pausado: 'Pausado',
    encerrado: 'Encerrado',
    prospecto: 'Prospecto',
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Clientes
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {clientes?.length || 0} cliente{(clientes?.length || 0) !== 1 ? 's' : ''} cadastrado{(clientes?.length || 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/dashboard/admin/clientes/novo" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
          <Plus size={15} />
          Novo cliente
        </Link>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Cliente', 'Nicho', 'Conta Meta', 'Gestor início', 'Status', ''].map(h => (
                <th key={h} style={{
                  padding: '12px 24px', textAlign: 'left',
                  fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)',
                  letterSpacing: '0.05em', textTransform: 'uppercase'
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clientes?.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border-subtle)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '14px 24px' }}>
                  <div style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)' }}>{c.nome}</div>
                  {c.empresa && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.empresa}</div>}
                </td>
                <td style={{ padding: '14px 24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {c.nicho || '—'}
                </td>
                <td style={{ padding: '14px 24px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {c.meta_account_id || '—'}
                  </span>
                </td>
                <td style={{ padding: '14px 24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {c.data_inicio ? new Date(c.data_inicio).toLocaleDateString('pt-BR') : '—'}
                </td>
                <td style={{ padding: '14px 24px' }}>
                  <span className={`badge ${statusColors[c.status] || 'badge-neutral'}`}>
                    {statusLabels[c.status] || c.status}
                  </span>
                </td>
                <td style={{ padding: '14px 24px' }}>
                  <Link
                    href={`/dashboard/admin/clientes/${c.id}`}
                    style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
                  >
                    Detalhes →
                  </Link>
                </td>
              </tr>
            ))}
            {(!clientes || clientes.length === 0) && (
              <tr>
                <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                  Nenhum cliente cadastrado ainda.{' '}
                  <Link href="/dashboard/admin/clientes/novo" style={{ color: 'var(--accent)' }}>Adicionar o primeiro</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
