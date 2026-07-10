'use client'

import { useState } from 'react'
import { Link2, Copy, Check, TrendingUp, Users, DollarSign, Crown, Star, Gem } from 'lucide-react'
import { useDict } from '@/lib/locale-context'
import { cn } from '@/lib/utils'

// ─── Dados mock MGM ───────────────────────────────────────────────────────────
const MGM_REFERRALS  = 150
const MGM_GOAL_OURO  = 200
const MGM_RATE       = '1,5%'
const MGM_TOTAL      = 'R$ 8.640'

type Tier = { key: 'tier_1' | 'tier_2' | 'tier_3'; icon: typeof Crown; min: number; max: number | null; color: string }

const TIERS: Tier[] = [
  { key: 'tier_1', icon: Star,    min: 0,   max: 49,  color: 'text-slate-500'  },
  { key: 'tier_2', icon: Gem,     min: 50,  max: 199, color: 'text-gold'       },
  { key: 'tier_3', icon: Crown,   min: 200, max: null, color: 'text-amber-400' },
]

const HISTORICO = [
  { mes: 'Jun 2026', makers: 150, ganho: 'R$ 1.840' },
  { mes: 'Mai 2026', makers: 142, ganho: 'R$ 1.720' },
  { mes: 'Abr 2026', makers: 130, ganho: 'R$ 1.510' },
  { mes: 'Mar 2026', makers: 118, ganho: 'R$ 1.380' },
  { mes: 'Fev 2026', makers: 104, ganho: 'R$ 1.190' },
  { mes: 'Jan 2026', makers: 89,  ganho: 'R$ 1.000' },
]

// ─── Utilitário ───────────────────────────────────────────────────────────────
function currentTierIndex() {
  if (MGM_REFERRALS >= 200) return 2
  if (MGM_REFERRALS >= 50)  return 1
  return 0
}

// ─── Barra de progresso ao Ouro ───────────────────────────────────────────────
function ProgressoOuro() {
  const t = useDict()
  const pct = Math.min(Math.round((MGM_REFERRALS / MGM_GOAL_OURO) * 100), 100)
  const faltam = MGM_GOAL_OURO - MGM_REFERRALS

  return (
    <div className="rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/10 via-gold/5 to-background p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-gold/20 text-gold">
          <TrendingUp className="size-5" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-gold">{t.indicacoes.nivel_atual}</p>
          <h3 className="font-heading text-xl text-navy">
            {t.indicacoes.tier_2_label} · {MGM_RATE}
          </h3>
        </div>
      </div>

      <p className="mb-3 text-xs text-muted-foreground">{t.indicacoes.progresso_label}</p>
      <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold/60 to-gold transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-sm font-semibold text-navy">{MGM_REFERRALS} Makers</span>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Crown className="size-3 text-amber-400" />
          {MGM_GOAL_OURO} → {t.indicacoes.tier_3_label}
        </span>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        <span className="font-semibold text-gold">{faltam}</span> {t.indicacoes.faltam}
      </p>
    </div>
  )
}

// ─── Cards de tier ────────────────────────────────────────────────────────────
function TierCards() {
  const t = useDict()
  const active = currentTierIndex()

  const tierData = [
    { label: t.indicacoes.tier_1_label, range: t.indicacoes.tier_1_range, rate: t.indicacoes.tier_1_rate },
    { label: t.indicacoes.tier_2_label, range: t.indicacoes.tier_2_range, rate: t.indicacoes.tier_2_rate },
    { label: t.indicacoes.tier_3_label, range: t.indicacoes.tier_3_range, rate: t.indicacoes.tier_3_rate },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {TIERS.map((tier, i) => {
        const isActive  = i === active
        const isPast    = i < active
        const Icon      = tier.icon
        const data      = tierData[i]

        return (
          <div
            key={tier.key}
            className={cn(
              'relative flex flex-col items-center rounded-2xl border p-4 text-center transition-all',
              isActive
                ? 'border-gold/60 bg-gradient-to-b from-gold/15 to-gold/5 shadow-sm'
                : isPast
                  ? 'border-border bg-secondary/50 opacity-70'
                  : 'border-border bg-card opacity-60',
            )}
          >
            {isActive && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gold px-2.5 py-0.5 text-[10px] font-bold text-navy">
                {t.indicacoes.nivel_atual}
              </span>
            )}
            <span className={cn('mb-2 flex size-9 items-center justify-center rounded-full', isActive ? 'bg-gold/20' : 'bg-secondary')}>
              <Icon className={cn('size-4', isActive ? 'text-gold' : isPast ? 'text-muted-foreground' : 'text-muted-foreground/50')} />
            </span>
            <p className={cn('font-heading text-2xl leading-none', isActive ? 'text-gold' : 'text-navy/50')}>{data.rate}</p>
            <p className="mt-1 text-xs font-semibold text-navy">{data.label}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{data.range}</p>
          </div>
        )
      })}
    </div>
  )
}

// ─── Cards de KPI rápido ──────────────────────────────────────────────────────
function KpiRow() {
  const t = useDict()

  const items = [
    { icon: Users,       label: t.indicacoes.makers_ativos,   value: String(MGM_REFERRALS), accent: false },
    { icon: DollarSign,  label: t.indicacoes.total_arrecadado, value: MGM_TOTAL,             accent: true  },
    { icon: TrendingUp,  label: t.indicacoes.taxa_atual,       value: MGM_RATE,              accent: true  },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className={cn(
              'flex flex-col gap-2 rounded-2xl border p-4',
              item.accent ? 'border-gold/40 bg-gold/5' : 'border-border bg-card',
            )}
          >
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Icon className={cn('size-3.5', item.accent ? 'text-gold' : '')} />
              <span className="text-[11px]">{item.label}</span>
            </div>
            <p className={cn('font-heading text-2xl leading-none', item.accent ? 'text-gold' : 'text-navy')}>
              {item.value}
            </p>
          </div>
        )
      })}
    </div>
  )
}

// ─── Gerador de link ──────────────────────────────────────────────────────────
function LinkGerador() {
  const t = useDict()
  const [link, setLink] = useState('')
  const [copied, setCopied] = useState(false)

  const gerar = () =>
    setLink('https://yourgaze.app/r/valentina-' + Math.random().toString(36).slice(2, 8))

  const copiar = () => {
    navigator.clipboard?.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 font-heading text-base text-navy">{t.indicacoes.link_title}</h3>
      {!link ? (
        <button
          onClick={gerar}
          className="flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-navy hover:opacity-90 transition-opacity"
        >
          <Link2 className="size-4" /> {t.indicacoes.gerar}
        </button>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-gold/50 bg-gold/5 p-3">
          <span className="flex-1 truncate text-sm text-navy">{link}</span>
          <button
            onClick={copiar}
            className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-xs font-medium text-primary-foreground transition-colors"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? t.indicacoes.copiado : t.indicacoes.copiar}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Histórico de ganhos ──────────────────────────────────────────────────────
function Historico() {
  const t = useDict()

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 font-heading text-base text-navy">{t.indicacoes.historico_title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="pb-2 pr-4 font-medium">{t.indicacoes.historico_mes}</th>
              <th className="pb-2 pr-4 font-medium">{t.indicacoes.historico_makers}</th>
              <th className="pb-2 font-medium text-right">{t.indicacoes.historico_ganho}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {HISTORICO.map((row) => (
              <tr key={row.mes} className="group">
                <td className="py-2.5 pr-4 text-navy">{row.mes}</td>
                <td className="py-2.5 pr-4 text-muted-foreground">{row.makers}</td>
                <td className="py-2.5 text-right font-semibold text-gold">{row.ganho}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export function IndicacoesScreen() {
  const t = useDict()

  return (
    <div className="px-6 py-8">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-gold">MGM</p>
        <h2 className="font-heading text-3xl text-navy">{t.indicacoes.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.indicacoes.subtitle}</p>
      </header>

      {/* Barra de progresso ao Nível Ouro */}
      <ProgressoOuro />

      {/* Cards de tier */}
      <div className="mt-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {t.indicacoes.tier_title}
        </p>
        <TierCards />
      </div>

      {/* KPIs rápidos */}
      <div className="mt-6">
        <KpiRow />
      </div>

      {/* Link de indicação */}
      <div className="mt-6">
        <LinkGerador />
      </div>

      {/* Histórico mensal */}
      <div className="mt-6">
        <Historico />
      </div>
    </div>
  )
}
