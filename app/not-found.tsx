import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Perfil não encontrado | Your Gaze',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center">
      {/* Anel decorativo */}
      <div className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, #D4AF37 0%, #F8EEB4 18%, #C9A227 36%, #F5E6A0 50%, #B8962E 68%, #F8EEB4 82%, #D4AF37 100%)',
        }}
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-950">
          <span className="font-serif text-4xl font-black text-amber-400">404</span>
        </div>
      </div>

      <h1 className="font-serif text-3xl font-bold text-white sm:text-4xl">
        Criador não encontrado
      </h1>

      <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
        O perfil que você procura não existe ou foi removido do ecossistema Your Gaze.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-xl bg-amber-400 px-8 py-3 text-sm font-bold text-slate-950 shadow-lg hover:bg-amber-500 transition-colors"
        >
          Voltar à Página Inicial
        </Link>
        <Link
          href="/maker-space"
          className="rounded-xl border border-amber-400/40 px-8 py-3 text-sm font-bold text-amber-300 hover:bg-slate-900 transition-colors"
        >
          Conhecer o Hub
        </Link>
      </div>

      <p className="mt-12 text-[11px] text-slate-600 italic">
        "See and be what others cannot." — Your Gaze
      </p>
    </main>
  )
}
