import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('nome, cargo')
    .eq('email', user.email)
    .single()

  if (perfil?.cargo !== 'admin') redirect('/auth/login')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar cargo="admin" nomeUsuario={perfil?.nome || user.email || 'Admin'} />
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg-primary)' }}>
        {children}
      </main>
    </div>
  )
}
