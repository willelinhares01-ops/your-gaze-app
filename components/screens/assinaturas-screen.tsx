'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Check,
  Crown,
  Gem,
  Sparkles,
  BookOpen,
  Radio,
  Info,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { makers } from '@/lib/data'
import { useApp } from '@/components/app-context'
import { useDict } from '@/lib/locale-context'
import { CheckoutModal } from '@/components/checkout-modal'
import { cn } from '@/lib/utils'

// ─── Metadados dos planos ─────────────────────────────────────────────────────
// Mantemos preço e perks em data.ts; aqui definimos apenas metadados de UI.

type TierMeta = {
  id: string
  name: string
  priceDisplay: string
  priceNote: string
  perks: readonly string[]
  icon: React.ElementType
  badge?: string
  featured?: boolean
  isFree?: boolean
  isCourses?: boolean
  cardClass: string
  iconClass: string
  badgeClass?: string
  ctaClass: string
}

const TIER_META: TierMeta[] = [
  {
    id: 'free',
    name: 'Espectador Grátis',
    priceDisplay: 'USD $0.00',
    priceNote: '',
    perks: ['Aba Degustação desbloqueada', 'Fotos e vídeos até 20s', 'Compras avulsas via Chat PPV'],
    icon: Star,
    isFree: true,
    cardClass: 'border-border bg-card',
    iconClass: 'text-muted-foreground',
    ctaClass: 'border-2 border-border text-navy hover:bg-secondary',
  },
  {
    id: 'premium',
    name: 'Fiel Espectador Premium',
    priceDisplay: 'USD $3.99 – $19.99',
    priceNote: '/mês',
    perks: ['10 a 20 vídeos (10s – 10min)', 'Até 50 fotos exclusivas', 'Chat direto com o Maker'],
    icon: Crown,
    cardClass: 'border-border bg-card',
    iconClass: 'text-navy',
    ctaClass: 'bg-navy text-gold hover:opacity-90',
  },
  {
    id: 'gold',
    name: 'Fiel Espectador Gold',
    priceDisplay: 'USD $19.99 – $39.99',
    priceNote: '/mês',
    perks: ['20 a 30 vídeos completos', 'Até 100 fotos exclusivas', 'Lives e Grupos VIP'],
    icon: Gem,
    featured: true,
    cardClass: 'border-gold bg-gold/5 shadow-lg',
    iconClass: 'text-gold',
    badgeClass: 'bg-gold text-navy',
    ctaClass: 'bg-gradient-to-r from-gold/80 to-gold text-navy hover:opacity-90',
  },
  {
    id: 'diamond',
    name: 'Fiel Espectador Diamond',
    priceDisplay: 'USD $49.00 – $199.99',
    priceNote: '/mês',
    perks: ['Acesso completo (30 a 50 vídeos)', 'PPV ilimitado incluído', 'Suporte Prioritário VIP 1:1'],
    icon: Sparkles,
    cardClass: 'border-navy/30 bg-navy/5',
    iconClass: 'text-navy',
    ctaClass: 'bg-navy text-gold hover:opacity-90',
  },
]

// ─── Card de Plano ────────────────────────────────────────────────────────────

function TierCard({
  tier,
  badgeLabel,
  freeLabel,
  ctaFree,
  ctaSubscribe,
  perMonth,
  onSubscribe,
}: {
  tier: TierMeta
  badgeLabel: string
  freeLabel: string
  ctaFree: string
  ctaSubscribe: string
  perMonth: string
  onSubscribe: () => void
}) {
  const Icon = tier.icon

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border p-6 transition-shadow hover:shadow-md',
        tier.cardClass,
        tier.featured && 'ring-1 ring-gold/40',
      )}
    >
      {/* Badge "Mais Popular" */}
      {tier.featured && (
        <span
          className={cn(
            'absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest shadow-sm',
            tier.badgeClass,
          )}
        >
          {badgeLabel}
        </span>
      )}

      {/* Ícone + Nome */}
      <div className="mb-4 flex items-center gap-2.5">
        <span
          className={cn(
            'flex size-9 items-center justify-center rounded-xl',
            tier.featured ? 'bg-gold/20' : 'bg-secondary',
          )}
        >
          <Icon className={cn('size-4.5', tier.iconClass)} strokeWidth={1.75} />
        </span>
        <h3 className="font-heading text-base font-bold text-navy leading-tight">{tier.name}</h3>
      </div>

      {/* Preço */}
      <div className="mb-5">
        {tier.isFree ? (
          <span className="inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-widest text-navy">
            {freeLabel}
          </span>
        ) : (
          <>
            <p className={cn('font-heading text-xl font-extrabold leading-none', tier.featured ? 'text-gold' : 'text-navy')}>
              {tier.priceDisplay}
            </p>
            {tier.priceNote && (
              <span className="mt-0.5 block text-xs text-muted-foreground">{perMonth}</span>
            )}
          </>
        )}
      </div>

      {/* Perks */}
      <ul className="mb-6 flex flex-1 flex-col gap-2.5">
        {tier.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2 text-sm text-navy">
            <Check className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={2.5} />
            {perk}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        type="button"
        onClick={tier.isFree ? undefined : onSubscribe}
        disabled={tier.isFree}
        className={cn(
          'mt-auto w-full rounded-xl py-3 text-sm font-bold transition-all active:scale-[.98]',
          tier.ctaClass,
          tier.isFree && 'cursor-default opacity-60',
        )}
      >
        {tier.isFree ? ctaFree : ctaSubscribe}
      </button>
    </div>
  )
}

// ─── Tela Principal ───────────────────────────────────────────────────────────

export function AssinaturasScreen() {
  const { isFiel } = useApp()
  const t = useDict()

  const [makerSel, setMakerSel] = useState(makers[0])
  const [checkout, setCheckout] = useState<{
    plan: string
    price: string
    maker: string
    makerId: string
    makerAvatar: string
  } | null>(null)

  return (
    <div className="px-4 py-8">

      {/* ── Cabeçalho ── */}
      <header className="mx-auto mb-2 max-w-5xl text-center">
        <h2 className="font-heading text-3xl text-navy">{t.assinaturas.title}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {t.assinaturas.subtitle_pre}{' '}
          <span className="font-semibold text-gold">{t.roles.fiel_espectador}</span>{' '}
          {t.assinaturas.subtitle_post}
        </p>
      </header>

      {/* ── Nota Institucional de Transparência (85/15) ── */}
      <div className="mx-auto mb-6 mt-4 flex max-w-5xl items-center justify-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-5 py-2">
        <ShieldCheck className="size-4 shrink-0 text-gold" strokeWidth={1.75} />
        <p className="text-xs font-semibold text-navy/80">{t.assinaturas.ecosystem_note}</p>
      </div>

      {/* ── Seletor de Maker ── */}
      <div className="mx-auto mb-8 max-w-5xl">
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t.assinaturas.escolha_maker}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {makers.map((m) => {
            const active = m.id === makerSel.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMakerSel(m)}
                className={cn(
                  'flex items-center gap-2 rounded-full border bg-card py-1.5 pl-1.5 pr-4 transition-colors',
                  active ? 'border-gold shadow-sm' : 'border-border hover:border-gold/50',
                )}
              >
                <span className="relative size-8 overflow-hidden rounded-full">
                  <Image src={m.avatar} alt={m.name} fill sizes="32px" className="object-cover" />
                </span>
                <span className={cn('text-sm', active ? 'font-semibold text-navy' : 'text-navy/70')}>
                  {m.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Grid dos 4 Tiers de Assinatura ── */}
      <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TIER_META.map((tier) => (
          <TierCard
            key={tier.id}
            tier={tier}
            badgeLabel={t.assinaturas.badge_popular}
            freeLabel={t.assinaturas.badge_free}
            ctaFree={t.assinaturas.cta_free}
            ctaSubscribe={t.assinaturas.cta_subscribe}
            perMonth={t.assinaturas.por_mes}
            onSubscribe={() =>
              setCheckout({
                plan:        tier.name,
                price:       tier.priceDisplay,
                maker:       makerSel.name,
                makerId:     makerSel.id,
                makerAvatar: makerSel.avatar,
              })
            }
          />
        ))}
      </div>

      {/* ── Card de Infoproduto: The Sovereign Creator Masterclass ── */}
      <div className="mx-auto mt-5 max-w-5xl">
        <div className="relative overflow-hidden rounded-2xl border border-navy/30 bg-navy shadow-xl">
          {/* Halos decorativos */}
          <div className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-gold/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 right-0 size-48 rounded-full bg-gold/8 blur-2xl" />

          <div className="relative flex flex-col gap-0 lg:flex-row">
            {/* ── Capa do Produto ── */}
            <div className="flex shrink-0 flex-col items-center justify-center gap-3 border-b border-white/10 bg-navy/80 px-8 py-8 lg:w-56 lg:border-b-0 lg:border-r">
              {/* Emblema dourado — olho minimalista */}
              <div className="flex size-20 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 shadow-inner">
                <BookOpen className="size-9 text-gold" strokeWidth={1.25} />
              </div>
              <span className="rounded-full border border-gold/40 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-gold">
                {t.assinaturas.badge_lifetime}
              </span>
              <p className="text-center text-[10px] font-medium text-primary-foreground/40 uppercase tracking-widest">
                {t.assinaturas.courses_section}
              </p>
            </div>

            {/* ── Corpo do Card ── */}
            <div className="flex flex-1 flex-col gap-5 p-6 lg:p-7">
              {/* Título */}
              <div>
                <h3 className="font-heading text-2xl font-black text-primary-foreground leading-tight">
                  {t.assinaturas.course_sovereign}
                </h3>
                <p className="mt-1 text-xs text-primary-foreground/50">
                  Acesso vitalício · 4 Módulos · 9 Capítulos · 12h+ de conteúdo
                </p>
              </div>

              {/* Preço com conversão BRL */}
              <div className="space-y-1">
                <p className="font-heading text-3xl font-extrabold text-gold">
                  {t.assinaturas.course_usd_price}
                </p>
                {/* Simulador de moeda local */}
                <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/10 px-3 py-1">
                  <span className="text-xs font-bold text-gold">
                    {t.assinaturas.course_brl_approx}
                  </span>
                  <span className="text-[10px] text-primary-foreground/50">
                    {t.assinaturas.course_brl_note}
                  </span>
                </div>
              </div>

              {/* Perks */}
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {[
                  'Psicologia da Escassez & PPV Direto',
                  'Leilões 1/1 e Gamificação de Ego',
                  'Retenção e Assinaturas Recorrentes',
                  'Domínio Global — Precificação em USD',
                ].map((perk) => (
                  <li key={perk} className="flex items-center gap-1.5 text-sm text-primary-foreground/80">
                    <Check className="size-3.5 shrink-0 text-gold" strokeWidth={2.5} />
                    {perk}
                  </li>
                ))}
              </ul>

              {/* Nota institucional de precificação */}
              <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <Info className="mt-0.5 size-3.5 shrink-0 text-primary-foreground/40" strokeWidth={1.75} />
                <p className="text-[11px] leading-relaxed text-primary-foreground/50">
                  {t.assinaturas.course_maker_note}
                </p>
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={() =>
                  setCheckout({
                    plan:        t.assinaturas.course_sovereign,
                    price:       t.assinaturas.course_usd_price,
                    maker:       makerSel.name,
                    makerId:     makerSel.id,
                    makerAvatar: makerSel.avatar,
                  })
                }
                className="self-start rounded-xl bg-gradient-to-r from-gold/80 to-gold px-8 py-3.5 text-sm font-extrabold text-navy shadow-lg transition-all hover:opacity-90 active:scale-[.98]"
              >
                {t.assinaturas.cta_courses} · {t.assinaturas.course_usd_price}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Nota de Autonomia do Maker ── */}
      <div className="mx-auto mt-5 flex max-w-5xl items-start gap-3 rounded-2xl border border-border bg-secondary/40 px-5 py-4">
        <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t.assinaturas.maker_autonomy}
        </p>
      </div>

      {/* ── Nota de Transmissões ── */}
      <div className="mx-auto mt-4 flex max-w-5xl items-start gap-3 rounded-2xl border border-gold/40 bg-gold/5 px-5 py-4">
        <Radio className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.75} />
        <p className="text-sm text-navy">
          <span className="font-semibold">{t.assinaturas.transmissoes_titulo}: </span>
          {t.assinaturas.transmissoes_pre}{' '}
          <span className="font-medium text-gold">{t.assinaturas.transmissoes_preco}</span>.
        </p>
      </div>

      {/* ── Assinaturas Ativas ── */}
      {isFiel && (
        <div className="mx-auto mt-8 max-w-5xl rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 font-heading text-lg text-navy">{t.assinaturas.makers_que_assina}</h3>
          <ul className="divide-y divide-border">
            {makers.slice(0, 2).map((m) => (
              <li key={m.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="relative size-8 overflow-hidden rounded-full">
                    <Image src={m.avatar} alt={m.name} fill sizes="32px" className="object-cover" />
                  </span>
                  <span className="text-sm font-medium text-navy">{m.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold">
                    Fiel Gold · USD $29.99/mês
                  </span>
                  <ShieldCheck className="size-4 text-gold" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Modal de Checkout ── */}
      {checkout && (
        <CheckoutModal
          plan={checkout.plan}
          price={checkout.price}
          maker={checkout.maker}
          makerId={checkout.makerId}
          makerAvatar={checkout.makerAvatar}
          onClose={() => setCheckout(null)}
        />
      )}
    </div>
  )
}
