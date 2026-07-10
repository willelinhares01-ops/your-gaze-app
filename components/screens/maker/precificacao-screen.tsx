'use client'

import { useState } from 'react'
import {
  DollarSign,
  Euro,
  Images,
  Gamepad2,
  Video,
  Lock,
  HandCoins,
  Radio,
  BookOpen,
  Clock,
  MessageSquareHeart,
  Crown,
  Gem,
  GraduationCap,
  Plus,
  Trash2,
  Info,
  TrendingUp,
} from 'lucide-react'
import { useDict } from '@/lib/locale-context'
import { cn } from '@/lib/utils'

// ─── Moedas suportadas ────────────────────────────────────────────────────────
type Currency = 'USD' | 'EUR' | 'BRL'

const RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  BRL: 5.20,
}

const SYMBOLS: Record<Currency, string> = {
  USD: 'US$',
  EUR: '€',
  BRL: 'R$',
}

const CURRENCY_ICONS: Record<Currency, typeof DollarSign> = {
  USD: DollarSign,
  EUR: Euro,
  BRL: DollarSign,
}

// ─── Tiers V2.0 (preços em USD — Maker define dentro da faixa permitida) ──────
const SUBSCRIPTION_TIERS = [
  { key: 'premium',  min: 3.99,  max: 19.99,  default: 9.99,  icon: Crown },
  { key: 'gold',     min: 19.99, max: 39.99,  default: 24.99, icon: Crown },
  { key: 'diamond',  min: 49.00, max: 199.99, default: 59.99, icon: Gem   },
] as const

// ─── Split financeiro ─────────────────────────────────────────────────────────
const SPLIT = {
  padrao: { platform: 15, maker: 85 },
  mimos:  { platform: 5,  maker: 95 },
} as const

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toLocal(usdValue: number, currency: Currency) {
  return (usdValue * RATES[currency]).toFixed(2)
}

const field =
  'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-gold'
const labelCls = 'mb-1.5 block text-xs font-medium text-muted-foreground'

// ─── Seletor de moeda ─────────────────────────────────────────────────────────
function CurrencySelector({
  value,
  onChange,
  label,
}: {
  value: Currency
  onChange: (c: Currency) => void
  label: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
        {(['USD', 'EUR', 'BRL'] as Currency[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-semibold transition-all',
              value === c
                ? 'bg-navy text-primary-foreground shadow-sm'
                : 'text-navy/50 hover:text-navy',
            )}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Badge de split financeiro ────────────────────────────────────────────────
function SplitBadge({
  platform,
  maker,
  label,
}: {
  platform: number
  maker: number
  label: string
}) {
  return (
    <div className="mt-3 flex items-center gap-1.5">
      <TrendingUp className="size-3 text-gold" />
      <span className="text-[10px] text-muted-foreground">{label}:</span>
      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
        Platform {platform}%
      </span>
      <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold text-gold">
        Maker {maker}%
      </span>
    </div>
  )
}

// ─── Campo monetário com suporte a moeda ──────────────────────────────────────
function PriceField({
  titulo,
  valorUsd,
  currency,
}: {
  titulo: string
  valorUsd: number
  currency: Currency
}) {
  const CurrIcon = CURRENCY_ICONS[currency]
  return (
    <div>
      <label className={labelCls}>{titulo}</label>
      <div className="relative">
        <CurrIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          defaultValue={toLocal(valorUsd, currency)}
          key={currency}
          className={field + ' pl-9'}
          type="number"
          min={0}
          step={0.01}
        />
      </div>
    </div>
  )
}

// ─── Card de tier de assinatura V2 ───────────────────────────────────────────
function TierField({
  tierKey,
  min,
  max,
  defaultVal,
  IconComp,
  labelText,
  rangeText,
  currency,
}: {
  tierKey: string
  min: number
  max: number
  defaultVal: number
  IconComp: typeof Crown
  labelText: string
  rangeText: string
  currency: Currency
}) {
  const CurrIcon = CURRENCY_ICONS[currency]
  const minLocal = toLocal(min, currency)
  const maxLocal = toLocal(max, currency)

  return (
    <div key={`${tierKey}-${currency}`}>
      <label className={labelCls}>
        <span className="flex items-center gap-1.5">
          <IconComp className="size-3.5 text-gold" />
          {labelText}
        </span>
      </label>
      <p className="mb-1.5 text-[10px] text-muted-foreground">
        {SYMBOLS[currency]} {minLocal} – {SYMBOLS[currency]} {maxLocal} / mês
      </p>
      <p className="mb-1.5 text-[10px] italic text-muted-foreground/70">{rangeText}</p>
      <div className="relative">
        <CurrIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          defaultValue={toLocal(defaultVal, currency)}
          key={`val-${tierKey}-${currency}`}
          className={field + ' pl-9'}
          type="number"
          min={toLocal(min, currency)}
          max={toLocal(max, currency)}
          step={0.01}
        />
      </div>
    </div>
  )
}

// ─── Card de categoria de precificação ────────────────────────────────────────
function PriceCard({
  icon: Icon,
  titulo,
  children,
  highlight = false,
}: {
  icon: typeof DollarSign
  titulo: string
  children: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border bg-card p-6',
        highlight ? 'border-gold/50 bg-gold/5' : 'border-border',
      )}
    >
      <h3 className="mb-4 flex items-center gap-2 font-heading text-lg text-navy">
        <Icon className="size-5 text-gold" /> {titulo}
      </h3>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

// ─── Tipo interno de edição de revista ───────────────────────────────────────
type Edicao = { id: string; titulo: string; periodo: 'Semanal' | 'Mensal'; preco: number }

// ─── Tela principal ───────────────────────────────────────────────────────────
export function PrecificacaoScreen() {
  const t = useDict()

  const [currency, setCurrency] = useState<Currency>('USD')
  const [ppv, setPpv] = useState(50)
  const [edicoes, setEdicoes] = useState<Edicao[]>([
    { id: 'e1', titulo: 'Edição #12 — Bastidores', periodo: 'Mensal', preco: 25 },
  ])
  const [titulo, setTitulo] = useState('')
  const [periodo, setPeriodo] = useState<'Semanal' | 'Mensal'>('Mensal')
  const [preco, setPreco] = useState(20)

  const addEdicao = () => {
    if (!titulo.trim()) return
    setEdicoes((e) => [...e, { id: crypto.randomUUID(), titulo, periodo, preco }])
    setTitulo('')
    setPreco(20)
  }

  const periodoLabel = (p: 'Semanal' | 'Mensal') =>
    p === 'Semanal' ? t.maker_pricing.revista_semanal : t.maker_pricing.revista_mensal

  const CurrIcon = CURRENCY_ICONS[currency]

  // Labels dos tiers V2
  const tierLabels: Record<string, { label: string; range: string }> = {
    premium: { label: t.maker_pricing.plano_premium_label, range: t.maker_pricing.plano_premium_range },
    gold:    { label: t.maker_pricing.plano_gold_label,    range: t.maker_pricing.plano_gold_range    },
    diamond: { label: t.maker_pricing.plano_diamond_label, range: t.maker_pricing.plano_diamond_range },
  }

  return (
    <div className="px-6 py-8">

      {/* Cabeçalho + seletor de moeda */}
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl text-navy">{t.maker_pricing.title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{t.maker_pricing.subtitle}</p>
        </div>
        <CurrencySelector
          value={currency}
          onChange={setCurrency}
          label={t.maker_pricing.moeda_seletor}
        />
      </header>

      {/* Aviso: Espectador Grátis */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-navy/50" />
        <p className="text-xs text-muted-foreground">{t.maker_pricing.espectador_gratis}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ── Planos de Assinatura V2 ─────────────────────────────────────── */}
        <PriceCard icon={Crown} titulo={t.maker_pricing.planos}>
          {SUBSCRIPTION_TIERS.map((tier) => {
            const meta = tierLabels[tier.key]
            return (
              <TierField
                key={tier.key}
                tierKey={tier.key}
                min={tier.min}
                max={tier.max}
                defaultVal={tier.default}
                IconComp={tier.icon}
                labelText={meta.label}
                rangeText={meta.range}
                currency={currency}
              />
            )
          })}
          <SplitBadge
            platform={SPLIT.padrao.platform}
            maker={SPLIT.padrao.maker}
            label={t.maker_pricing.split_info}
          />
        </PriceCard>

        {/* ── Módulo Cursos ───────────────────────────────────────────────── */}
        <PriceCard icon={GraduationCap} titulo={t.maker_pricing.cursos_title} highlight>
          <p className="text-xs text-muted-foreground">{t.maker_pricing.cursos_subtitle}</p>
          <p className="text-[10px] text-gold">{t.maker_pricing.cursos_range}</p>
          <PriceField titulo={t.maker_pricing.cursos_unico} valorUsd={49} currency={currency} />
          <PriceField titulo={t.maker_pricing.cursos_anual} valorUsd={99} currency={currency} />
          <SplitBadge
            platform={SPLIT.padrao.platform}
            maker={SPLIT.padrao.maker}
            label={t.maker_pricing.split_info}
          />
        </PriceCard>

        {/* ── Combos de mensagens ─────────────────────────────────────────── */}
        <PriceCard icon={MessageSquareHeart} titulo={t.maker_pricing.combos_msg}>
          <PriceField titulo={t.maker_pricing.campo_msgs_10}  valorUsd={15} currency={currency} />
          <PriceField titulo={t.maker_pricing.campo_msgs_50}  valorUsd={60} currency={currency} />
          <PriceField titulo={t.maker_pricing.campo_msgs_100} valorUsd={100} currency={currency} />
          <SplitBadge
            platform={SPLIT.padrao.platform}
            maker={SPLIT.padrao.maker}
            label={t.maker_pricing.split_info}
          />
        </PriceCard>

        {/* ── Fotos ───────────────────────────────────────────────────────── */}
        <PriceCard icon={Images} titulo={t.maker_pricing.combos_fotos}>
          <PriceField titulo={t.maker_pricing.campo_foto_avulsa} valorUsd={5}  currency={currency} />
          <PriceField titulo={t.maker_pricing.campo_combo_10f}   valorUsd={35} currency={currency} />
          <PriceField titulo={t.maker_pricing.campo_combo_30f}   valorUsd={80} currency={currency} />
          <SplitBadge
            platform={SPLIT.padrao.platform}
            maker={SPLIT.padrao.maker}
            label={t.maker_pricing.split_info}
          />
        </PriceCard>

        {/* ── Vídeos avulsos ──────────────────────────────────────────────── */}
        <PriceCard icon={Video} titulo={t.maker_pricing.videos}>
          <PriceField titulo={t.maker_pricing.campo_video_curto} valorUsd={12} currency={currency} />
          <PriceField titulo={t.maker_pricing.campo_video_longo} valorUsd={40} currency={currency} />
          <SplitBadge
            platform={SPLIT.padrao.platform}
            maker={SPLIT.padrao.maker}
            label={t.maker_pricing.split_info}
          />
        </PriceCard>

        {/* ── Games ───────────────────────────────────────────────────────── */}
        <PriceCard icon={Gamepad2} titulo={t.maker_pricing.games}>
          <PriceField titulo={t.maker_pricing.campo_game} valorUsd={18} currency={currency} />
          <SplitBadge
            platform={SPLIT.padrao.platform}
            maker={SPLIT.padrao.maker}
            label={t.maker_pricing.split_info}
          />
        </PriceCard>

        {/* ── Mimos (ex-Gorjetas) — taxa especial 95%/5% ─────────────────── */}
        <PriceCard icon={HandCoins} titulo={t.maker_pricing.mimos} highlight>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <HandCoins className="size-3.5 text-gold" />
            {t.maker_pricing.mimos_desc}
          </p>
          <PriceField titulo={t.maker_pricing.campo_mimo_min} valorUsd={3}  currency={currency} />
          <PriceField titulo={t.maker_pricing.campo_mimo_sug} valorUsd={20} currency={currency} />
          {/* Taxa especial para Mimos */}
          <SplitBadge
            platform={SPLIT.mimos.platform}
            maker={SPLIT.mimos.maker}
            label={t.maker_pricing.split_info}
          />
        </PriceCard>

        {/* ── Lives pagas ─────────────────────────────────────────────────── */}
        <PriceCard icon={Radio} titulo={t.maker_pricing.lives}>
          <PriceField titulo={t.maker_pricing.campo_live_ingresso} valorUsd={30}  currency={currency} />
          <PriceField titulo={t.maker_pricing.campo_live_privada}  valorUsd={150} currency={currency} />
          <SplitBadge
            platform={SPLIT.padrao.platform}
            maker={SPLIT.padrao.maker}
            label={t.maker_pricing.split_info}
          />
        </PriceCard>

        {/* ── Compra de tempo ─────────────────────────────────────────────── */}
        <PriceCard icon={Clock} titulo={t.maker_pricing.tempo_video}>
          <PriceField titulo={t.maker_pricing.campo_min_adicional} valorUsd={4}  currency={currency} />
          <PriceField titulo={t.maker_pricing.campo_pacote_15min}  valorUsd={45} currency={currency} />
          <SplitBadge
            platform={SPLIT.padrao.platform}
            maker={SPLIT.padrao.maker}
            label={t.maker_pricing.split_info}
          />
        </PriceCard>

        {/* ── Mensagens personalizadas ────────────────────────────────────── */}
        <PriceCard icon={MessageSquareHeart} titulo={t.maker_pricing.msg_personalizadas}>
          <PriceField titulo={t.maker_pricing.campo_video_dedicado} valorUsd={50} currency={currency} />
          <PriceField titulo={t.maker_pricing.campo_audio_pers}     valorUsd={20} currency={currency} />
          <SplitBadge
            platform={SPLIT.padrao.platform}
            maker={SPLIT.padrao.maker}
            label={t.maker_pricing.split_info}
          />
        </PriceCard>

        {/* ── PPV ─────────────────────────────────────────────────────────── */}
        <PriceCard icon={Lock} titulo={t.maker_pricing.ppv_title}>
          <p className="text-xs text-muted-foreground">{t.maker_pricing.ppv_range}</p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={3}
              max={1000}
              value={ppv}
              onChange={(e) => setPpv(Number(e.target.value))}
              className="flex-1 accent-[#D4AF37]"
            />
            <span className="w-32 rounded-lg bg-navy px-3 py-2 text-center text-sm font-semibold text-primary-foreground">
              {SYMBOLS[currency]} {toLocal(ppv, currency)}
            </span>
          </div>
          <SplitBadge
            platform={SPLIT.padrao.platform}
            maker={SPLIT.padrao.maker}
            label={t.maker_pricing.split_info}
          />
        </PriceCard>
      </div>

      {/* ── Revista Digital ─────────────────────────────────────────────────── */}
      <div className="mt-6 rounded-2xl border border-gold/50 bg-gold/5 p-6">
        <h3 className="mb-1 flex items-center gap-2 font-heading text-lg text-navy">
          <BookOpen className="size-5 text-gold" /> {t.maker_pricing.revista_title}
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">{t.maker_pricing.revista_subtitle}</p>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
          <div>
            <label className={labelCls}>{t.maker_pricing.revista_titulo_ed}</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder={t.maker_pricing.revista_titulo_ph}
              className={field}
            />
          </div>

          <div>
            <label className={labelCls}>{t.maker_pricing.revista_periodicidade}</label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as 'Semanal' | 'Mensal')}
              className={field}
            >
              <option value="Semanal">{t.maker_pricing.revista_semanal}</option>
              <option value="Mensal">{t.maker_pricing.revista_mensal}</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>{t.maker_pricing.revista_preco}</label>
            <div className="relative">
              <CurrIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={preco}
                onChange={(e) => setPreco(Number(e.target.value))}
                type="number"
                min={0}
                step={0.01}
                className={field + ' w-28 pl-9'}
              />
            </div>
          </div>

          <button
            onClick={addEdicao}
            className="flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus className="size-4" /> {t.maker_pricing.revista_criar}
          </button>
        </div>

        {edicoes.length > 0 && (
          <ul className="mt-5 divide-y divide-gold/20 border-t border-gold/20">
            {edicoes.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-navy">{e.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {periodoLabel(e.periodo)} · {SYMBOLS[currency]} {toLocal(e.preco, currency)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-navy hover:border-gold">
                    {t.maker_pricing.revista_editar}
                  </button>
                  <button
                    onClick={() => setEdicoes((list) => list.filter((x) => x.id !== e.id))}
                    title={t.maker_pricing.revista_remover}
                    className="rounded-md border border-border p-1.5 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <SplitBadge
          platform={SPLIT.padrao.platform}
          maker={SPLIT.padrao.maker}
          label={t.maker_pricing.split_info}
        />
      </div>
    </div>
  )
}
