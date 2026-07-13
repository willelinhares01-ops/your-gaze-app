'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FullLogo } from '@/components/brand/full-logo'
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clapperboard,
  DollarSign,
  Users,
  Gavel,
  Gift,
  ShieldCheck,
} from 'lucide-react'

// ─── Pilares do Your Gaze Space (seção Maker) ────────────────────────────────

const MAKER_PILLARS = [
  {
    icon:  Clapperboard,
    title: 'Your Gaze Space — Estúdio Completo',
    desc:  'Hub exclusivo de gestão: eventos ao vivo, tutoriais estratégicos, podcast de alta renda e vitrine do ecossistema.',
  },
  {
    icon:  DollarSign,
    title: 'Governança Financeira 85/15',
    desc:  'Repasse líquido fixo de 85% ao Maker. Taxa fixa de plataforma de 15% — sem taxas ocultas, sem negociação.',
  },
  {
    icon:  DollarSign,
    title: 'Multi-moeda Ancorado em USD ($)',
    desc:  'Precifique em Dólar e receba de Espectadores do mundo inteiro. Blindagem patrimonial automática contra inflação local.',
  },
  {
    icon:  Users,
    title: 'MGM Fundadores — 2% Vitalícios',
    desc:  'Makers #1 ao #1.000 recebem 2% fixos para sempre sobre cada venda dos seus indicados, pago da fatia da plataforma.',
  },
  {
    icon:  Gavel,
    title: 'Leilões Exclusivos & Mimos Coletivos',
    desc:  'Lance em peça única (1/1) ou lote para grupo de vencedores. Gamifique Mimos em Lives e desbloqueie pacotes coletivos.',
  },
  {
    icon:  Gift,
    title: 'Chat PPV, Vitrine & Infoprodutos',
    desc:  'Cobrança por DMs com desfoque estratégico, e-commerce sem taxa extra e cursos de Grátis a USD $500.000+.',
  },
]

// ─── Componentes internos ─────────────────────────────────────────────────────

function MakerPillarsPanel() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 shadow-sm">
      {/* Cabeçalho do painel */}
      <div className="border-b border-slate-100 px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
          Your Gaze Space — O que você ganha como Maker
        </p>
      </div>

      {/* Pilares */}
      <ul className="divide-y divide-slate-100">
        {MAKER_PILLARS.map(({ icon: Icon, title, desc }) => (
          <li key={title} className="flex items-start gap-4 px-6 py-4">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50">
              <Icon className="size-4 text-amber-500" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-800">{title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{desc}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* CTA secundário — Hub institucional */}
      <div className="px-6 pb-2 pt-4">
        <Link
          href="/maker-space"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-slate-950 px-6 py-3 font-bold text-amber-400 shadow-lg transition-all hover:bg-slate-900 active:scale-[.98]"
        >
          Conhecer o Your Gaze Hub ➔
        </Link>
      </div>

      {/* CTA definitivo */}
      <div className="border-t border-slate-100 p-6">
        <Link
          href="/app?step=onboarding-maker"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-4 text-base font-extrabold text-slate-950 shadow-md shadow-amber-300/40 transition-all hover:bg-amber-500 active:scale-[.98]"
        >
          <ShieldCheck className="size-5" strokeWidth={2} />
          Me Tornar um Maker Your Gaze
        </Link>
        <p className="mt-3 text-center text-[11px] text-slate-400">
          Verificação KYC via Yoti · Recebimento em USD · Repasse garantido de 85%
        </p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [makerOpen, setMakerOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">

      {/* ── Topo — Logo oficial ──────────────────────────────────────────────── */}
      <header className="flex flex-col items-center px-6 pb-4 pt-14">
        {/* Logo com bg branco — mixBlendMode multiply renderiza corretamente */}
        <FullLogo width={300} className="w-[220px] sm:w-[300px]" />

        {/* Lema oficial */}
        <p className="mt-3 font-serif text-sm italic font-medium tracking-wide text-slate-400">
          "See and be what others cannot."
        </p>
      </header>

      {/* ── Hero Central — Os 3 Comandos ─────────────────────────────────────── */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-10">
        <div className="w-full max-w-sm">

          {/* ── Bloco Maker ───────────────────────────────────────────────────── */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => setMakerOpen((v) => !v)}
              aria-expanded={makerOpen}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-8 py-4 text-base font-bold text-slate-950 shadow-md transition-all hover:bg-amber-500 active:scale-[.98]"
            >
              Clique em Maker
              {makerOpen
                ? <ChevronUp  className="size-4 opacity-60" />
                : <ChevronDown className="size-4 opacity-60" />
              }
            </button>
            <p className="mt-2 max-w-xs text-center text-xs leading-relaxed text-slate-500">
              E seja tudo que os outros não são, conhecendo as suas possibilidades de ganho e trabalho.
            </p>
          </div>

          {/* Painel Maker — expandível */}
          {makerOpen && (
            <div className="mt-4">
              <MakerPillarsPanel />
            </div>
          )}

          {/* ── Separador ─────────────────────────────────────────────────────── */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-xs font-medium text-slate-300">ou</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          {/* ── Bloco Espectador ──────────────────────────────────────────────── */}
          <div className="flex flex-col items-center">
            <Link
              href="/app?step=onboarding-espectador"
              className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-8 py-4 text-base font-bold text-amber-300 shadow-md transition-all hover:bg-slate-800 active:scale-[.98]"
            >
              Clique em Espectador
            </Link>
            <p className="mt-2 text-center text-xs leading-relaxed text-slate-500">
              E veja tudo que os outros não veem.
            </p>
          </div>

          {/* ── Login ─────────────────────────────────────────────────────────── */}
          <p className="mt-8 text-center text-sm text-slate-500">
            Já possui uma conta?{' '}
            <Link
              href="/app"
              className="font-semibold text-amber-600 underline underline-offset-2 transition-colors hover:text-amber-500"
            >
              Entrar (Login)
            </Link>
          </p>
        </div>
      </main>

      {/* ── Rodapé mínimo ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 px-6 py-5">
        <div className="mx-auto flex max-w-sm flex-col items-center gap-1.5 text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase">
            YOUR GAZE · YOUR GAZE SPACE
          </p>
          <p className="text-[10px] text-slate-300">
            © {new Date().getFullYear()} · Plataforma de soberania audiovisual · Repasse 85% ao Maker
          </p>
        </div>
      </footer>

    </div>
  )
}

