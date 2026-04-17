import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CampanhasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: cliente } = await supabase
    .from('clientes')
    .select('id, nome')
    .eq('email', user.email)
    .single()

  if (!cliente) redirect('/dashboard/cliente')

  const dataInicio = new Date()
  dataInicio.setDate(dataInicio.getDate() - 30)

  const { data: resultados } = await supabase
    .from('resultados_campanha')
    .select('*')
    .eq('cliente_id', cliente.id)
    .gte('data_referencia', dataInicio.toISOString().split('T')[0])
    .order('data_referencia', { ascending: false })

  // Agrupa por anúncio
  const anunciosMap = new Map<string, {
    nome: string
    campanha: string
    gasto: number
    conversas: number
    impressoes: number
    alcance: number
    cliques: number
    dias: number
  }>()

  resultados?.forEach(r => {
    const key = r.meta_ad_id || r.nome_campanha || 'sem-id'
    const existing = anunciosMap.get(key)
    if (existing) {
      existing.gasto += r.valor_gasto || 0
      existing.conversas += r.leads_gerados || 0
      existing.impressoes += r.impressoes || 0
      existing.alcance += r.alcance || 0
      existing.cliques += r.cliques || 0
      existing.dias += 1
    } else {
      anunciosMap.set(key, {
        nome: r.nome_anuncio || r.nome_campanha || key,
        campanha: r.nome_campanha || '',
        gasto: r.valor_gasto || 0,
        conversas: r.leads_gerados || 0,
        impressoes: r.impressoes || 0,
        alcance: r.alcance || 0,
        cliques: r.cliques || 0,
        dias: 1,
      })
    }
  })

  const anuncios = [...anunciosMap.entries()].sort((a, b) => b[1].gasto - a[1].gasto)
  const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Campanhas e Anúncios
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Últimos 30 dias — performance por anúncio
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Anúncio', 'Campanha', 'Gasto', 'Conversas', 'CPL', 'Impressões', 'Alcance', 'Cliques', 'CTR'].map(h => (
                  <th key={h} style={{
                    padding: '12px 20px', textAlign: 'left',
                    fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)',
                    letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {anuncios.map(([key, a]) => {
                const cpl = a.conversas > 0 ? a.gasto / a.conversas : 0
                const ctr = a.impressoes > 0 ? (a.cliques / a.impressoes * 100) : 0
                return (
                  <tr key={key} style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border-subtle)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px', maxWidth: '220px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.nome}
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', maxWidth: '200px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.campanha || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      {fmtBRL(a.gasto)}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-primary)', textAlign: 'center' }}>
                      {a.conversas}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', whiteSpace: 'nowrap', color: a.conversas > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                      {a.conversas > 0 ? fmtBRL(cpl) : '—'}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {a.impressoes.toLocaleString('pt-BR')}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {a.alcance.toLocaleString('pt-BR')}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {a.cliques.toLocaleString('pt-BR')}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {ctr.toFixed(2)}%
                    </td>
                  </tr>
                )
              })}
              {anuncios.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                    Nenhum dado de campanha nos últimos 30 dias
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
