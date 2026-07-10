'use client'

import { useState } from 'react'
import {
  TrendingUp,
  Wallet,
  Users,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Gem,
  Crown,
  Star,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { fontesReceita, salesByMonth } from '@/lib/data'
import { useDict } from '@/lib/locale-context'
import { cn } from '@/lib/utils'

// ─── Dados de MGM (mock) ──────────────────────────────────────────────────────
const MGM_REFERRALS = 150   // makers indicados atualmente
const MGM_GOAL      = 200   // meta para Nível Ouro
const MGM_RATE      = '1,5%'
const MGM_TIER      = 'tier_2' // Profissional

// ─── Formatação ───────────────────────────────────────────────────────────────
const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

// ─── Tipos ────────────────────────────────────────────────────────────────────
type KpiItem = {
  label: string
  value: string
  change: number
  icon: LucideIcon
  accent: boolean
  description: string
}

type AtividadeItem = { icon: LucideIcon; text: string; time: string; gold: boolean }

// ─── Card de KPI ─────────────────────────────────────────────────────────────
function KpiCard({ label, value, change, icon: Icon, accent, description }: KpiItem) {
  const up = change >= 0
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border p-5 transition-shadow hover:shadow-md',
        accent
          ? 'border-gold/50 bg-gradient-to-br from-gold/10 via-gold/5 to-background'
          : 'border-border bg-card',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span
          className={cn(
            'flex size-8 items-center justify-center rounded-full',
            accent ? 'bg-gold/20 text-gold' : 'bg-secondary text-navy/60',
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>

      <p className={cn('font-heading text-2xl leading-none', accent ? 'text-gold' : 'text-navy')}>
        {value}
      </p>

      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
            up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600',
          )}
        >
          {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {Math.abs(change)}%
        </span>
        <span className="text-[11px] text-muted-foreground">{description}</span>
      </div>
    </div>
  )
}

// ─── Card especial: Comissão Vitalícia ────────────────────────────────────────
function ComissaoKpiCard() {
  const t = useDict()
  const pct = Math.round((MGM_REFERRALS / MGM_GOAL) * 100)
  const faltam = MGM_GOAL - MGM_REFERRALS

  return (
    <div className="col-span-2 flex flex-col gap-3 rounded-2xl border border-gold/50 bg-gradient-to-br from-gold/10 via-gold/5 to-background p-5 transition-shadow hover:shadow-md lg:col-span-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{t.maker_metrics.kpi_comissao}</span>
        <span className="flex size-8 items-center justify-center rounded-full bg-gold/20 text-gold">
          <TrendingUp className="size-4" />
        </span>
      </div>

      <div className="flex items-end justify-between">
        <p className="font-heading text-2xl leading-none text-gold">{MGM_RATE}</p>
        <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[11px] font-semibold text-gold">
          {t.maker_metrics.comissao_tier}
        </span>
      </div>

      {/* barra de progresso ao Nível Ouro */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{MGM_REFERRALS} Makers</span>
          <span>{MGM_GOAL} → Ouro</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold/60 to-gold transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          {faltam} {t.maker_metrics.comissao_faltam}
        </p>
      </div>
    </div>
  )
}

// ─── Gráfico de barras (simulado) ─────────────────────────────────────────────
function BarChart() {
  const t = useDict()
  const [hovered, setHovered] = useState<string | null>(null)
  const max = Math.max(...salesByMonth.map((m) => m.valor))

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="font-heading text-lg text-navy">{t.maker_metrics.chart_title}</h3>
        <span className="rounded-full bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold">
          2026
        </span>
      </div>
      <p className="mb-6 text-xs text-muted-foreground">{t.maker_metrics.chart_subtitle}</p>

      <div className="flex h-52 items-end justify-between gap-3">
        {salesByMonth.map((m) => {
          const pct = (m.valor / max) * 85 + 8
          const isHovered = hovered === m.mes
          return (
            <div
              key={m.mes}
              className="group flex flex-1 flex-col items-center gap-2"
              onMouseEnter={() => setHovered(m.mes)}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                className={cn(
                  'rounded-md bg-navy px-2 py-0.5 text-[10px] font-semibold text-gold transition-all',
                  isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1',
                )}
              >
                {m.valor}
              </span>
              <div className="relative flex h-full w-full items-end">
                <div
                  className={cn(
                    'w-full rounded-t-lg transition-all duration-300',
                    isHovered ? 'bg-gold' : 'bg-gradient-to-t from-navy to-navy/60',
                  )}
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{m.mes}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Fontes de receita ────────────────────────────────────────────────────────
function ReceitaSources() {
  const t = useDict()
  const bruto = fontesReceita.reduce((s, f) => s + f.valor, 0)

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="font-heading text-lg text-navy">{t.maker_metrics.fontes_title}</h3>
        <span className="text-xs font-semibold text-gold">{brl(bruto)}</span>
      </div>
      <p className="mb-5 text-xs text-muted-foreground">{t.maker_metrics.fontes_subtitle}</p>

      <ul className="flex flex-col gap-3.5">
        {fontesReceita.map((f) => (
          <li key={f.nome}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs text-navy">{f.nome}</span>
              <span className="text-xs font-semibold text-gold">{brl(f.valor)}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-navy to-gold transition-all duration-700"
                style={{ width: `${f.pct}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Atividade recente ────────────────────────────────────────────────────────
function AtividadeRecente() {
  const t = useDict()

  // Textos dinâmicos de atividade resolvidos pelo dicionário ativo
  const atividades: AtividadeItem[] = [
    { icon: Crown,      text: t.maker_metrics.atividade_1, time: 'há 4 min',  gold: true  },
    { icon: Star,       text: t.maker_metrics.atividade_2, time: 'há 18 min', gold: true  },
    { icon: Users,      text: t.maker_metrics.atividade_3, time: 'há 1 h',    gold: false },
    { icon: Gem,        text: t.maker_metrics.atividade_4, time: 'há 2 h',    gold: false },
    { icon: TrendingUp, text: t.maker_metrics.atividade_5, time: 'há 3 h',    gold: false },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-5 font-heading text-lg text-navy">{t.maker_metrics.atividade_title}</h3>
      <ul className="flex flex-col divide-y divide-border">
        {atividades.map((a: AtividadeItem, i) => {
          const Icon: LucideIcon = a.icon
          return (
            <li key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <span
                className={cn(
                  'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full',
                  a.gold ? 'bg-gold/15 text-gold' : 'bg-secondary text-navy/60',
                )}
              >
                <Icon className="size-3.5" />
              </span>
              <div className="flex-1">
                <p className="text-sm text-navy">{a.text}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{a.time}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export function MetricasScreen() {
  const t = useDict()

  // KPIs definidos aqui para ter acesso ao dicionário via hook
  const kpis: KpiItem[] = [
    { label: t.maker_metrics.kpi_receita,    value: 'R$ 57.160', change: +18.4, icon: Wallet,     accent: true,  description: t.maker_metrics.kpi_receita_desc    },
    { label: t.maker_metrics.kpi_fieis,      value: '134',        change: +9.2,  icon: Crown,      accent: false, description: t.maker_metrics.kpi_fieis_desc      },
    { label: t.maker_metrics.kpi_views,      value: '218 mil',    change: +31.7, icon: Eye,        accent: false, description: t.maker_metrics.kpi_views_desc      },
    { label: t.maker_metrics.kpi_lucro,      value: 'R$ 48.586', change: +18.4, icon: TrendingUp, accent: false, description: t.maker_metrics.kpi_lucro_desc      },
    { label: t.maker_metrics.kpi_assinantes, value: '342',        change: -2.1,  icon: Users,      accent: false, description: t.maker_metrics.kpi_assinantes_desc },
    { label: t.maker_metrics.kpi_conversao,  value: '6,8%',       change: +1.3,  icon: Zap,        accent: false, description: t.maker_metrics.kpi_conversao_desc  },
  ]

  return (
    <div className="px-6 py-8">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-gold">
          {t.maker_metrics.painel}
        </p>
        <h2 className="font-heading text-3xl text-navy">{t.maker_metrics.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.maker_metrics.subtitle}</p>
      </header>

      {/* Grade de KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
        <ComissaoKpiCard />
      </div>

      {/* Gráfico + Fontes de receita */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <BarChart />
        <ReceitaSources />
      </div>

      {/* Atividade recente */}
      <div className="mt-6">
        <AtividadeRecente />
      </div>
    </div>
  )
}
