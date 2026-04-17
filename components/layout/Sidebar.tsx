'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Zap, LayoutDashboard, Users, BarChart2, MessageSquare,
  CreditCard, Image, Settings, LogOut, ChevronLeft, Sun, Moon, Menu
} from 'lucide-react'
import type { Cargo } from '@/types'

interface SidebarProps {
  cargo: Cargo
  nomeUsuario: string
}

const menuPorCargo: Record<Cargo, { href: string; label: string; icon: React.ElementType }[]> = {
  admin: [
    { href: '/dashboard/admin', label: 'Visão Geral', icon: LayoutDashboard },
    { href: '/dashboard/admin/clientes', label: 'Clientes', icon: Users },
    { href: '/dashboard/admin/resultados', label: 'Resultados', icon: BarChart2 },
    { href: '/dashboard/admin/conversas', label: 'Conversas', icon: MessageSquare },
    { href: '/dashboard/admin/pagamentos', label: 'Pagamentos', icon: CreditCard },
    { href: '/dashboard/admin/criativos', label: 'Criativos', icon: Image },
    { href: '/dashboard/admin/configuracoes', label: 'Configurações', icon: Settings },
  ],
  gestor: [
    { href: '/dashboard/gestor', label: 'Visão Geral', icon: LayoutDashboard },
    { href: '/dashboard/gestor/clientes', label: 'Clientes', icon: Users },
    { href: '/dashboard/gestor/resultados', label: 'Resultados', icon: BarChart2 },
    { href: '/dashboard/gestor/conversas', label: 'Conversas', icon: MessageSquare },
  ],
  suporte: [
    { href: '/dashboard/cliente', label: 'Resumo', icon: LayoutDashboard },
    { href: '/dashboard/cliente/campanhas', label: 'Campanhas', icon: BarChart2 },
    { href: '/dashboard/cliente/conversas', label: 'Conversas', icon: MessageSquare },
  ],
  cliente: [
    { href: '/dashboard/cliente', label: 'Resumo', icon: LayoutDashboard },
    { href: '/dashboard/cliente/campanhas', label: 'Campanhas', icon: BarChart2 },
    { href: '/dashboard/cliente/conversas', label: 'Conversas', icon: MessageSquare },
  ],
}

export default function Sidebar({ cargo, nomeUsuario }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(
    typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : true
  )

  const menu = menuPorCargo[cargo] || menuPorCargo.cliente

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    setDarkMode(isDark)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <aside style={{
      width: collapsed ? '64px' : '240px',
      minHeight: '100vh',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderBottom: '1px solid var(--border)',
        minHeight: '64px'
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'var(--accent)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <Zap size={16} color="white" fill="white" />
        </div>
        {!collapsed && (
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            Fluxo Gestão
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            cursor: 'pointer', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', padding: '4px'
          }}
        >
          {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {menu.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard/admin' && item.href !== '/dashboard/gestor' && item.href !== '/dashboard/cliente' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 10px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-subtle)' : 'transparent',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--border-subtle)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              {!collapsed && item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <button
          onClick={toggleTheme}
          title={collapsed ? (darkMode ? 'Modo claro' : 'Modo escuro') : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 10px', borderRadius: '8px', border: 'none',
            background: 'none', cursor: 'pointer',
            fontSize: '14px', color: 'var(--text-secondary)', width: '100%',
            whiteSpace: 'nowrap', overflow: 'hidden'
          }}
        >
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          {!collapsed && (darkMode ? 'Modo claro' : 'Modo escuro')}
        </button>

        <button
          onClick={handleLogout}
          title={collapsed ? 'Sair' : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 10px', borderRadius: '8px', border: 'none',
            background: 'none', cursor: 'pointer',
            fontSize: '14px', color: 'var(--text-secondary)', width: '100%',
            whiteSpace: 'nowrap', overflow: 'hidden'
          }}
        >
          <LogOut size={17} />
          {!collapsed && 'Sair'}
        </button>

        {!collapsed && (
          <div style={{ padding: '10px', marginTop: '4px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {nomeUsuario}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {cargo.charAt(0).toUpperCase() + cargo.slice(1)}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
