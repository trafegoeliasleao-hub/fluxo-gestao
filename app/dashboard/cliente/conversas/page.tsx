'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, X, ChevronDown } from 'lucide-react'
import type { Conversa } from '@/types'

export default function ConversasClientePage() {
  const supabase = createClient()
  const [conversas, setConversas] = useState<Conversa[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<'pendente' | 'preenchido' | 'todos'>('pendente')

  useEffect(() => {
    carregarConversas()
  }, [])

  async function carregarConversas() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: cliente } = await supabase
      .from('clientes')
      .select('id')
      .eq('email', user.email)
      .single()

    if (!cliente) return

    const { data } = await supabase
      .from('conversas')
      .select('*')
      .eq('cliente_id', cliente.id)
      .order('data_conversa', { ascending: false })

    setConversas(data || [])
    setLoading(false)
  }

  async function marcarVenda(id: string, virou: boolean, valor?: number) {
    setSalvando(id)
    const agora = new Date().toISOString()

    await supabase
      .from('conversas')
      .update({
        virou_venda: virou,
        valor_venda: virou ? valor : null,
        status_registro: 'preenchido',
        preenchido_em: agora,
      })
      .eq('id', id)

    setConversas(prev => prev.map(c =>
      c.id === id
        ? { ...c, virou_venda: virou, valor_venda: virou ? valor : undefined, status_registro: 'preenchido', preenchido_em: agora }
        : c
    ))
    setSalvando(null)
  }

  async function ignorar(id: string) {
    setSalvando(id)
    await supabase.from('conversas').update({ status_registro: 'ignorado' }).eq('id', id)
    setConversas(prev => prev.map(c => c.id === id ? { ...c, status_registro: 'ignorado' } : c))
    setSalvando(null)
  }

  const conversasFiltradas = conversas.filter(c => {
    if (filtro === 'todos') return true
    if (filtro === 'pendente') return c.status_registro === 'pendente'
    return c.status_registro === 'preenchido'
  })

  const pendentes = conversas.filter(c => c.status_registro === 'pendente').length
  const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  if (loading) {
    return (
      <div style={{ padding: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Carregando conversas...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.75rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Conversas
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          {pendentes > 0 ? `${pendentes} conversa${pendentes > 1 ? 's' : ''} aguardando seu preenchimento` : 'Todas as conversas estão preenchidas ✓'}
        </p>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { key: 'pendente', label: `Pendentes (${conversas.filter(c => c.status_registro === 'pendente').length})` },
          { key: 'preenchido', label: `Preenchidas (${conversas.filter(c => c.status_registro === 'preenchido').length})` },
          { key: 'todos', label: 'Todas' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key as typeof filtro)}
            style={{
              padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
              border: '1px solid var(--border)', cursor: 'pointer',
              background: filtro === f.key ? 'var(--accent)' : 'transparent',
              color: filtro === f.key ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.15s'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {conversasFiltradas.map((c) => (
          <ConversaCard
            key={c.id}
            conversa={c}
            salvando={salvando === c.id}
            onMarcarVenda={marcarVenda}
            onIgnorar={ignorar}
            fmtBRL={fmtBRL}
          />
        ))}
        {conversasFiltradas.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            Nenhuma conversa encontrada
          </div>
        )}
      </div>
    </div>
  )
}

function ConversaCard({
  conversa, salvando, onMarcarVenda, onIgnorar, fmtBRL
}: {
  conversa: Conversa
  salvando: boolean
  onMarcarVenda: (id: string, virou: boolean, valor?: number) => void
  onIgnorar: (id: string) => void
  fmtBRL: (v: number) => string
}) {
  const [mostrarValor, setMostrarValor] = useState(false)
  const [valor, setValor] = useState(conversa.valor_venda?.toString() || '')
  const isPendente = conversa.status_registro === 'pendente'

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {conversa.nome_anuncio || conversa.nome_campanha || 'Anúncio'}
            </span>
            <span className={`badge ${isPendente ? 'badge-warning' : conversa.virou_venda ? 'badge-success' : 'badge-neutral'}`}>
              {isPendente ? 'Pendente' : conversa.virou_venda ? 'Venda' : 'Não vendeu'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              📅 {new Date(conversa.data_conversa).toLocaleDateString('pt-BR')}
            </span>
            {conversa.custo_conversa && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                💰 Custo: {fmtBRL(conversa.custo_conversa)}
              </span>
            )}
            {conversa.nome_campanha && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                📢 {conversa.nome_campanha}
              </span>
            )}
          </div>

          {!isPendente && conversa.valor_venda && (
            <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--success)', fontWeight: 600 }}>
              Valor da venda: {fmtBRL(conversa.valor_venda)}
            </div>
          )}
        </div>

        {/* Ações */}
        {isPendente && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
            {!mostrarValor ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setMostrarValor(true)}
                  disabled={salvando}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '7px 12px', borderRadius: '7px', fontSize: '13px', fontWeight: 500,
                    background: 'rgba(34, 197, 94, 0.15)', color: 'var(--success)',
                    border: '1px solid rgba(34, 197, 94, 0.3)', cursor: 'pointer'
                  }}
                >
                  <Check size={13} /> Virou venda
                </button>
                <button
                  onClick={() => onMarcarVenda(conversa.id, false)}
                  disabled={salvando}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '7px 12px', borderRadius: '7px', fontSize: '13px', fontWeight: 500,
                    background: 'rgba(239, 68, 68, 0.1)', color: 'var(--destructive)',
                    border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer'
                  }}
                >
                  <X size={13} /> Não vendeu
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: 'var(--text-muted)' }}>R$</span>
                  <input
                    type="number"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="0,00"
                    className="input"
                    style={{ paddingLeft: '30px', width: '130px', height: '36px', fontSize: '13px' }}
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => onMarcarVenda(conversa.id, true, valor ? parseFloat(valor) : undefined)}
                  disabled={salvando}
                  style={{
                    padding: '7px 14px', borderRadius: '7px', fontSize: '13px', fontWeight: 500,
                    background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer'
                  }}
                >
                  {salvando ? '...' : 'Confirmar'}
                </button>
                <button
                  onClick={() => setMostrarValor(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
