import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value }: any) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }: any) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (pathname.startsWith('/auth')) {
    if (user) {
      const { data: perfil } = await supabase
        .from('usuarios')
        .select('cargo')
        .eq('email', user.email)
        .single()

      const cargo = perfil?.cargo || 'cliente'
      return NextResponse.redirect(new URL(`/dashboard/${cargo}`, request.url))
    }
    return supabaseResponse
  }

  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    const { data: perfil } = await supabase
      .from('usuarios')
      .select('cargo')
      .eq('email', user.email)
      .single()

    const cargo = perfil?.cargo || 'cliente'

    if (cargo === 'admin') return supabaseResponse
    if (cargo === 'gestor' && pathname.startsWith('/dashboard/gestor')) return supabaseResponse
    if (cargo === 'suporte' && pathname.startsWith('/dashboard/cliente')) return supabaseResponse

    if (!pathname.startsWith(`/dashboard/${cargo}`)) {
      return NextResponse.redirect(new URL(`/dashboard/${cargo}`, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}