import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware unificado — Edge Runtime.
 *
 * Responsabilidades:
 *   1. Rastreamento MGM: persiste o cookie `yourgaze_mgm_ref` por 30 dias
 *      quando o parâmetro `?ref=` está presente na URL de entrada.
 *
 * Proteção do Admin:
 *   A rota /admin é uma Next.js App Router page real.
 *   A autenticação é tratada na própria página (AdminTokenGate) para permitir
 *   que o Next.js sirva o bundle corretamente ao admin autenticado.
 *   Em produção, adicionar validação JWT do Supabase SSR no edge.
 */
export function middleware(request: NextRequest) {
  // ── Rastreamento de Indicação MGM (cookie 30 dias) ───────────────────────
  const response = NextResponse.next()
  const ref = request.nextUrl.searchParams.get('ref')

  if (ref) {
    response.cookies.set({
      name: 'yourgaze_mgm_ref',
      value: ref,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    })
  }

  return response
}

export const config = {
  // Cobre todas as rotas públicas e de admin, excluindo assets estáticos e API.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
