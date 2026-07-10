'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  LayoutDashboard,
  Users,
  Wallet,
  AlertTriangle,
  Megaphone,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Eye,
  LogOut,
  Crown,
  Lock,
} from 'lucide-react'

import { makers, adminTransactions } from '@/lib/data'
import { StatCard } from '@/components/admin/StatCard'

// ─── Constante: token mestre de desenvolvimento ───────────────────────────────
// Em produção: validar JWT Supabase no edge. Aqui usamos env var pública como
// camada de sandbox para evitar acesso acidental.
const DEV_ADMIN_TOKEN =
  process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? 'yourgaze-master-2026'

// ─── Tipos do menu lateral ────────────────────────────────────────────────────

type SidebarSection =
  | 'overview'
  | 'makers-kyc'
  | 'financial'
  | 'disputes'
  | 'ads-engine'

const SIDEBAR_ITEMS: Array<{
  key: SidebarSection
  label: string
  icon: React.ReactNode
}> = [
  { key: 'overview',    label: 'Visão Geral',      icon: <LayoutDashboard className="size-4" /> },
  { key: 'makers-kyc',  label: 'Makers & KYC',     icon: <Users           className="size-4" /> },
  { key: 'financial',   label: 'Motor Financeiro',  icon: <Wallet          className="size-4" /> },
  { key: 'disputes',    label: 'Disputas',          icon: <AlertTriangle   className="size-4" /> },
  { key: 'ads-engine',  label: 'Ads Engine',        icon: <Megaphone       className="size-4" /> },
]

// ─── Formatador de moeda ──────────────────────────────────────────────────────

function fmtUSD(v: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(v)
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

// ─── Badge de tipo de transação ───────────────────────────────────────────────

const TYPE_STYLES: Record<string, string> = {
  subscription: 'bg-sky-900/60 text-sky-300 border-sky-700/50',
  ppv:          'bg-violet-900/60 text-violet-300 border-violet-700/50',
  auction:      'bg-rose-900/60 text-rose-300 border-rose-700/50',
  mimo:         'bg-pink-900/60 text-pink-300 border-pink-700/50',
}
const TYPE_LABEL: Record<string, string> = {
  subscription: 'Assinatura',
  ppv:          'PPV',
  auction:      'Leilão',
  mimo:         'Mimo',
}

// ─── Token Gate (autenticação inline) ────────────────────────────────────────

function AdminTokenGate({ onAuth }: { onAuth: () => void }) {
  const [token, setToken] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (token.trim() === DEV_ADMIN_TOKEN) {
      onAuth()
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-amber-500/20 bg-slate-900 p-8 shadow-2xl">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-400/10 border border-amber-400/30">
            <Lock className="size-6 text-amber-400" />
          </div>
          <h1 className="font-serif text-xl font-bold text-white">Master Dashboard</h1>
          <p className="text-xs text-slate-400 text-center">
            Acesso restrito à Diretoria Your Gaze
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Token de Acesso
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="••••••••••••••••"
              className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:ring-2 focus:ring-amber-400/40 ${
                error
                  ? 'border-red-500 ring-2 ring-red-500/30'
                  : 'border-slate-700'
              }`}
              autoFocus
            />
            {error && (
              <p className="mt-1.5 text-xs text-red-400">Token inválido. Tente novamente.</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-amber-400 py-3 text-sm font-bold text-slate-950 shadow-lg hover:bg-amber-500 transition-colors active:scale-[.98]"
          >
            Acessar God Mode
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Seção: Visão Geral ───────────────────────────────────────────────────────

function OverviewSection() {
  // KPIs calculados a partir dos mocks
  const stats = useMemo(() => {
    const grossTotal    = adminTransactions.reduce((s, t) => s + t.grossUSD, 0)
    const platformTotal = adminTransactions.reduce((s, t) => s + t.platformShareUSD, 0)
    const activeMakers  = makers.length
    const kycPending    = makers.filter(
      (m) => !m.kycStatus || m.kycStatus === 'PENDING',
    ).length

    return { grossTotal, platformTotal, activeMakers, kycPending }
  }, [])

  return (
    <div className="flex flex-col gap-8">
      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<DollarSign className="size-5 text-amber-400" />}
          label="Receita Global (USD)"
          value={fmtUSD(stats.grossTotal)}
          trend={{ pct: 14.2, label: 'vs. mês anterior' }}
          footnote="Total bruto transacionado na plataforma"
          featured
        />
        <StatCard
          icon={<TrendingUp className="size-5 text-emerald-400" />}
          label="Receita da Plataforma (15%)"
          value={fmtUSD(stats.platformTotal)}
          trend={{ pct: 9.8, label: 'vs. mês anterior' }}
          footnote="Taxa fixa retida após split 85/15"
        />
        <StatCard
          icon={<Users className="size-5 text-sky-400" />}
          label="Makers Ativos"
          value={String(stats.activeMakers)}
          trend={{ pct: 2.1, label: 'novos este mês' }}
          footnote="Criadores com pelo menos 1 publicação"
        />
        <StatCard
          icon={<ShieldCheck className="size-5 text-rose-400" />}
          label="KYC Pendentes"
          value={String(stats.kycPending)}
          trend={{ pct: stats.kycPending > 0 ? -stats.kycPending : 0 }}
          footnote="Verificações Yoti aguardando auditoria"
        />
      </div>

      {/* ── Últimas Transações ── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-white">
            Últimas Transações
          </h2>
          <span className="rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-400">
            Split 85% Maker · 15% Plataforma
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800">
          {/* Cabeçalho da tabela */}
          <div className="hidden grid-cols-[auto_1fr_auto_auto_auto_auto] gap-x-4 border-b border-slate-800 bg-slate-900/60 px-5 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500 lg:grid">
            <span>Tipo</span>
            <span>Descrição · Espectador</span>
            <span className="text-right">Bruto</span>
            <span className="text-right">Maker (85%)</span>
            <span className="text-right">Plataforma (15%)</span>
            <span className="text-right">Data/Hora</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {adminTransactions.map((tx) => (
              <div
                key={tx.id}
                className="group flex flex-col gap-2 px-5 py-4 hover:bg-slate-800/30 transition-colors lg:grid lg:grid-cols-[auto_1fr_auto_auto_auto_auto] lg:items-center lg:gap-x-4"
              >
                {/* Tipo */}
                <span
                  className={`w-fit rounded border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    TYPE_STYLES[tx.type] ?? ''
                  }`}
                >
                  {TYPE_LABEL[tx.type]}
                </span>

                {/* Descrição */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {tx.description}
                  </p>
                  <p className="text-xs text-slate-500">
                    <span className="text-amber-500">{tx.viewerHandle}</span>
                    {' → '}
                    <span className="text-slate-300">{tx.makerHandle}</span>
                  </p>
                </div>

                {/* Bruto */}
                <div className="flex items-center justify-between lg:block">
                  <span className="text-xs text-slate-500 lg:hidden">Bruto</span>
                  <span className="text-sm font-bold text-white">
                    {fmtUSD(tx.grossUSD)}
                  </span>
                </div>

                {/* Maker 85% */}
                <div className="flex items-center justify-between lg:block lg:text-right">
                  <span className="text-xs text-slate-500 lg:hidden">Maker (85%)</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {fmtUSD(tx.makerShareUSD)}
                  </span>
                </div>

                {/* Plataforma 15% */}
                <div className="flex items-center justify-between lg:block lg:text-right">
                  <span className="text-xs text-slate-500 lg:hidden">Plataforma (15%)</span>
                  <span className="text-sm font-semibold text-amber-400">
                    {fmtUSD(tx.platformShareUSD)}
                  </span>
                </div>

                {/* Data */}
                <div className="flex items-center justify-between lg:block lg:text-right">
                  <span className="text-xs text-slate-500 lg:hidden">Data/Hora</span>
                  <span className="text-xs text-slate-500">{fmtDate(tx.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Seção: Makers & KYC ─────────────────────────────────────────────────────

function MakersKycSection() {
  return (
    <div>
      <h2 className="mb-4 font-serif text-lg font-bold text-white">Makers & KYC</h2>
      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <div className="hidden grid-cols-[auto_1fr_auto_auto_auto] gap-x-4 border-b border-slate-800 bg-slate-900/60 px-5 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500 sm:grid">
          <span>#</span>
          <span>Maker</span>
          <span className="text-center">Fundadora</span>
          <span className="text-center">KYC</span>
          <span className="text-right">Ads Revenue</span>
        </div>
        <div className="divide-y divide-slate-800/60">
          {makers.map((m, i) => (
            <div
              key={m.id}
              className="flex flex-col gap-2 px-5 py-4 hover:bg-slate-800/30 transition-colors sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto] sm:items-center sm:gap-x-4"
            >
              <span className="text-xs font-bold text-slate-600">
                #{String(i + 1).padStart(3, '0')}
              </span>
              <div className="flex items-center gap-3">
                <img
                  src={m.avatar}
                  alt={m.name}
                  width={32}
                  height={32}
                  className="rounded-full object-cover border border-slate-700"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <div>
                  <p className="text-sm font-semibold text-white">{m.name}</p>
                  <p className="text-xs text-amber-500">{m.handle}</p>
                </div>
              </div>
              <div className="flex justify-center">
                {typeof m.founderNumber === 'number' && m.founderNumber <= 1000 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 text-[10px] font-black text-amber-400">
                    <Crown className="size-3" /> #{m.founderNumber}
                  </span>
                ) : (
                  <span className="text-xs text-slate-600">—</span>
                )}
              </div>
              <div className="flex justify-center">
                {m.kycStatus === 'VERIFIED' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-black text-emerald-400">
                    <ShieldCheck className="size-3" /> VERIFIED
                  </span>
                ) : m.kycStatus === 'REJECTED' ? (
                  <span className="text-[10px] font-black text-red-400 border border-red-500/30 bg-red-500/10 rounded-full px-2 py-0.5">
                    REJECTED
                  </span>
                ) : (
                  <span className="text-[10px] font-black text-amber-300 border border-amber-500/30 bg-amber-500/10 rounded-full px-2 py-0.5">
                    PENDING
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-300">
                  {m.adRevenueUSD != null ? fmtUSD(m.adRevenueUSD) : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Seção: Placeholder para abas futuras ─────────────────────────────────────

function ComingSoonSection({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700">
        <Eye className="size-7 text-amber-400" />
      </div>
      <h2 className="font-serif text-xl font-bold text-white">{label}</h2>
      <p className="mt-2 text-sm text-slate-400">
        Módulo em construção — disponível na próxima release.
      </p>
    </div>
  )
}

// ─── Dashboard principal (pós-autenticação) ───────────────────────────────────

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeSection, setActiveSection] = useState<SidebarSection>('overview')

  function renderSection() {
    switch (activeSection) {
      case 'overview':   return <OverviewSection />
      case 'makers-kyc': return <MakersKycSection />
      case 'financial':  return <ComingSoonSection label="Motor Financeiro" />
      case 'disputes':   return <ComingSoonSection label="Disputas" />
      case 'ads-engine': return <ComingSoonSection label="Ads Engine" />
    }
  }

  const activeItem = SIDEBAR_ITEMS.find((i) => i.key === activeSection)

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* ── Sidebar ── */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900">
        {/* Logo */}
        <div className="border-b border-slate-800 px-5 py-5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">
            Your Gaze
          </p>
          <h1 className="mt-0.5 font-serif text-base font-bold text-white">
            Master Dashboard
          </h1>
          <p className="mt-0.5 text-[11px] text-slate-500">Diretoria · God Mode</p>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                activeSection === item.key
                  ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-800 px-3 py-4">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-red-900/20 hover:text-red-400 transition-all"
          >
            <LogOut className="size-4" />
            Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* ── Conteúdo principal ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-8 py-4">
          <div className="flex items-center gap-3">
            {activeItem?.icon && (
              <span className="text-amber-400">{activeItem.icon}</span>
            )}
            <h2 className="text-base font-bold text-white">
              {activeItem?.label}
            </h2>
          </div>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-400">
            ● Ao Vivo
          </span>
        </header>

        {/* Área de conteúdo */}
        <main className="flex-1 overflow-y-auto px-8 py-8">
          {renderSection()}
        </main>
      </div>
    </div>
  )
}

// ─── Página raiz ──────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)

  const handleAuth    = useCallback(() => setAuthenticated(true),  [])
  const handleLogout  = useCallback(() => setAuthenticated(false), [])

  if (!authenticated) {
    return <AdminTokenGate onAuth={handleAuth} />
  }

  return <AdminDashboard onLogout={handleLogout} />
}
