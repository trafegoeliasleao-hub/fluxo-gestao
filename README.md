# Fluxo Gestão

Plataforma de gestão de tráfego pago — dashboard multi-perfil integrado com Meta Ads API e Supabase.

## Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript
- **Estilo:** Tailwind CSS + CSS Variables (tema dark/light)
- **Banco:** Supabase (PostgreSQL + Auth + RLS)
- **Deploy:** Vercel
- **Automação:** N8N (Meta Ads API → Supabase)

## Perfis de acesso

| Perfil | Acesso |
|--------|--------|
| `admin` | Visão total — todos os clientes, financeiro, configurações |
| `gestor` | Clientes atribuídos — métricas e conversas |
| `suporte` | Portal do cliente (social media) |
| `cliente` | Resumo, campanhas, preenchimento de vendas |

## Setup local

```bash
# 1. Clone o repositório
git clone https://github.com/trafegoeliasleao-hub/fluxo-gestao.git
cd fluxo-gestao

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Preencha as variáveis no .env.local

# 4. Rode em desenvolvimento
npm run dev
```

## Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

## Deploy no Vercel

1. Importe o repositório no Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push na branch `main`

## Estrutura

```
app/
  auth/login/          → Página de login
  dashboard/
    admin/             → Painel do admin
    cliente/           → Portal do cliente
    gestor/            → Painel do gestor
components/
  layout/Sidebar.tsx   → Navegação lateral
  ui/MetricCard.tsx    → Card de métrica
  charts/              → Gráficos Recharts
lib/supabase/          → Clientes Supabase (server/client)
types/                 → Types TypeScript
middleware.ts          → Auth + roteamento por perfil
```
