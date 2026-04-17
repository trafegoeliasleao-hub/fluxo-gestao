import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'

export default async function GestorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('nome, cargo')
    .eq('email', user.email)
    .single()

  if (!perfil || !['gestor', 'admin'].includes(perfil.cargo)) redirect('/auth/login')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar cargo="gestor" nomeUsuario={perfil?.nome || user.email || 'Gestor'} />
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg-primary)' }}>
        {children}
      </main>
    </div>
  )
}
