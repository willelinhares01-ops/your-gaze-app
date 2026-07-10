'use client'

import { useMemo } from 'react'
import { DollarSign, Gavel, Users } from 'lucide-react'
import { useDict } from '@/lib/locale-context'
import { posts, sampleMessages, fontesReceita, currentMaker } from '@/lib/data'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extrai o valor numérico de strings de preço no formato "US$ 12,00" ou "R$ 9,90".
 * Remove todos os caracteres que não sejam dígitos ou vírgula, depois converte
 * vírgula decimal → ponto para que parseFloat funcione corretamente.
 */
function parsePriceToNumber(price: string): number {
  return parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.')) || 0
}

/** Formata um número como moeda BRL (pt-BR), ex.: R$ 57.009,90 */
function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ─── Tela ─────────────────────────────────────────────────────────────────────

export function DashboardScreen() {
  const t = useDict()

  // ── Receita Total ────────────────────────────────────────────────────────
  // Base histórica: soma de todas as fontes de receita do Maker (lib/data.ts).
  // Unlock dinâmico: mensagens PPV desbloqueadas na sessão atual.
  // Quando integrado ao Supabase, substituir `fontesReceita` pela query real.
  const totalRevenue = useMemo(() => {
    const base = fontesReceita.reduce((sum, fonte) => sum + fonte.valor, 0)

    const ppvUnlocked = sampleMessages
      .filter((m) => m.media?.unlocked === true)
      .reduce((sum, m) => sum + parsePriceToNumber(m.media!.price), 0)

    return base + ppvUnlocked
  }, [])

  // ── Leilões Ativos ───────────────────────────────────────────────────────
  // Posts do currentMaker que possuem leilão competitivo em curso.
  const activeAuctions = useMemo(
    () =>
      posts.filter(
        (p) => p.maker.id === currentMaker.id && p.leilaoCompetitivo !== undefined,
      ).length,
    [],
  )

  // ── Assinantes Ativos ────────────────────────────────────────────────────
  // Proxy: soma de `sales` nos posts do currentMaker.
  // `sales` representa assinaturas + vendas avulsas atribuídas a cada post.
  const activeSubscribers = useMemo(
    () =>
      posts
        .filter((p) => p.maker.id === currentMaker.id)
        .reduce((sum, p) => sum + p.sales, 0),
    [],
  )

  // ── Configuração dos cards ───────────────────────────────────────────────
  const stats = [
    {
      label: t.dashboard.total_revenue,
      value: formatBRL(totalRevenue),
      icon:  DollarSign,
      color: 'text-gold',
      bg:    'bg-gold/10',
    },
    {
      label: t.dashboard.active_auctions,
      value: String(activeAuctions),
      icon:  Gavel,
      color: 'text-emerald-500',
      bg:    'bg-emerald-50',
    },
    {
      label: t.dashboard.active_subscribers,
      value: activeSubscribers.toLocaleString('pt-BR'),
      icon:  Users,
      color: 'text-navy',
      bg:    'bg-navy/10',
    },
  ]

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">
          {t.dashboard.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.dashboard.subtitle}
        </p>
      </div>

      {/* Cards de KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <span className={`flex size-12 items-center justify-center rounded-xl ${stat.bg}`}>
                <Icon className={`size-6 ${stat.color}`} strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-navy">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
