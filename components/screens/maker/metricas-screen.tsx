'use client'

import { TrendingUp, Wallet, Users, Percent } from 'lucide-react'
import { fontesReceita, salesByMonth } from '@/lib/data'

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export function MetricasScreen() {
  const bruto = fontesReceita.reduce((s, f) => s + f.valor, 0)
  const liquido = Math.round(bruto * 0.85)
  const maxMes = Math.max(...salesByMonth.map((m) => m.valor))

  const cards = [
    { label: 'Faturamento Bruto', value: brl(bruto), icon: TrendingUp },
    { label: 'Lucro Líquido (85%)', value: brl(liquido), icon: Wallet, gold: true },
    { label: 'Assinantes ativos', value: '342', icon: Users },
    { label: 'Comissão YOUR GAZE', value: '15%', icon: Percent },
  ]

  return (
    <div className="px-6 py-8">
      <header className="mb-6">
        <h2 className="font-heading text-2xl text-navy">Métricas de Vendas</h2>
        <p className="text-sm text-muted-foreground">O coração do seu lucro líquido — 11 fontes de receita.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                <Icon className="size-4" />
                <span className="text-xs">{c.label}</span>
              </div>
              <p className={`font-heading text-2xl ${c.gold ? 'text-gold' : 'text-navy'}`}>{c.value}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Gráfico de vendas */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-5 font-heading text-lg text-navy">Vendas por mês</h3>
          <div className="flex h-48 items-end justify-between gap-3">
            {salesByMonth.map((m) => (
              <div key={m.mes} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div
                  className="w-full rounded-t-md bg-gold transition-all"
                  style={{ height: `${(m.valor / maxMes) * 90 + 6}%` }}
                />
                <span className="text-xs text-muted-foreground">{m.mes}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 11 fontes de receita */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-5 font-heading text-lg text-navy">Fontes de receita</h3>
          <ul className="flex flex-col gap-3">
            {fontesReceita.map((f) => (
              <li key={f.nome}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-navy">{f.nome}</span>
                  <span className="font-medium text-gold">{brl(f.valor)}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-navy" style={{ width: `${f.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
