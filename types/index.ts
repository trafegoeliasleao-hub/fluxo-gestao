export type Cargo = 'admin' | 'gestor' | 'suporte' | 'cliente'

export interface Usuario {
  id: string
  nome: string
  email: string
  telefone?: string
  cargo: Cargo
  avatar_url?: string
  ativo: boolean
  criado_em: string
}

export interface Cliente {
  id: string
  nome: string
  empresa?: string
  email?: string
  telefone?: string
  whatsapp?: string
  nicho?: string
  cidade?: string
  estado?: string
  meta_account_id?: string
  gestor_id?: string
  status: 'ativo' | 'pausado' | 'encerrado' | 'prospecto'
  data_inicio?: string
  data_fim?: string
  observacoes?: string
  criado_em: string
}

export interface ResultadoCampanha {
  id: string
  cliente_id: string
  meta_campanha_id?: string
  meta_conjunto_id?: string
  meta_ad_id?: string
  nome_campanha?: string
  nome_conjunto?: string
  nome_anuncio?: string
  data_referencia: string
  impressoes: number
  alcance: number
  cliques: number
  cliques_link: number
  ctr: number
  cpc: number
  cpm: number
  valor_gasto: number
  leads_gerados: number
  custo_por_lead?: number
  objetivo?: string
  dados_extras?: Record<string, unknown>
  criado_em: string
}

export interface Conversa {
  id: string
  cliente_id: string
  criativo_id?: string
  meta_ad_id?: string
  meta_campanha_id?: string
  meta_conjunto_id?: string
  nome_campanha?: string
  nome_conjunto?: string
  nome_anuncio?: string
  data_conversa: string
  custo_conversa?: number
  origem: 'facebook' | 'instagram'
  nome_contato?: string
  telefone_contato?: string
  virou_venda: boolean
  valor_venda?: number
  data_venda?: string
  observacao?: string
  status_registro: 'pendente' | 'preenchido' | 'ignorado'
  dados_extras?: Record<string, unknown>
  criado_em: string
}

export interface MetricasResumo {
  total_gasto: number
  total_conversas: number
  total_vendas: number
  taxa_conversao: number
  custo_por_conversa: number
  custo_por_venda: number
  receita_total: number
  impressoes: number
  alcance: number
  cliques: number
  ctr_medio: number
}
