'use client'

import { useMemo, useState } from 'react'
import {
  DollarSign,
  TrendingDown,
  Building2,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  KeyRound,
  ArrowRightLeft,
} from 'lucide-react'
import { useDict } from '@/lib/locale-context'
import { fontesReceita, sampleMessages } from '@/lib/data'
import { cn } from '@/lib/utils'

// ─── Constantes de Negócio ────────────────────────────────────────────────────

const MAKER_SHARE  = 0.85
const PLATFORM_FEE = 0.15

/**
 * Status KYC mock — quando o Supabase for integrado, substituir pela query:
 * `SELECT kyc_status FROM profiles WHERE id = auth.uid()`
 * Valores possíveis: 'approved' | 'pending' | 'rejected'
 */
const MOCK_KYC_STATUS: 'approved' | 'pending' | 'rejected' = 'pending'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type PixKeyType = 'cpf_cnpj' | 'email' | 'phone' | 'random'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parsePriceToNumber(price: string): number {
  return parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.')) || 0
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function PayoutEngine() {
  const t = useDict()
  const [pixKeyType, setPixKeyType] = useState<PixKeyType>('cpf_cnpj')
  const [pixKey,     setPixKey]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success,    setSuccess]    = useState(false)

  const kycApproved = MOCK_KYC_STATUS === 'approved'

  // ── Motor de Cálculo (Split 85/15) ────────────────────────────────────────
  const grossRevenue = useMemo(() => {
    const base = fontesReceita.reduce((sum, f) => sum + f.valor, 0)
    const ppv  = sampleMessages
      .filter((m) => m.media?.unlocked === true)
      .reduce((sum, m) => sum + parsePriceToNumber(m.media!.price), 0)
    return base + ppv
  }, [])

  const makerShare  = grossRevenue * MAKER_SHARE
  const platformFee = grossRevenue * PLATFORM_FEE

  // ── Cards de Split ────────────────────────────────────────────────────────
  const splitCards = [
    {
      label:  t.payout.gross_label,
      desc:   t.payout.gross_desc,
      value:  formatBRL(grossRevenue),
      icon:   ArrowRightLeft,
      accent: 'border-border bg-card',
      iconBg: 'bg-navy/10',
      iconColor: 'text-navy',
      valueColor: 'text-navy',
    },
    {
      label:  t.payout.net_label,
      desc:   t.payout.net_desc,
      value:  formatBRL(makerShare),
      icon:   DollarSign,
      accent: 'border-gold/40 bg-gold/5',
      iconBg: 'bg-gold/15',
      iconColor: 'text-gold',
      valueColor: 'text-gold',
    },
    {
      label:  t.payout.fee_label,
      desc:   t.payout.fee_desc,
      value:  formatBRL(platformFee),
      icon:   Building2,
      accent: 'border-border bg-secondary/40',
      iconBg: 'bg-muted',
      iconColor: 'text-muted-foreground',
      valueColor: 'text-muted-foreground',
    },
  ] as const

  // ── Tipos de chave PIX ────────────────────────────────────────────────────
  const pixTypes: { value: PixKeyType; label: string; placeholder: string }[] = [
    { value: 'cpf_cnpj', label: t.payout.pix_type_cpf,    placeholder: t.payout.pix_ph_cpf    },
    { value: 'email',    label: t.payout.pix_type_email,   placeholder: t.payout.pix_ph_email  },
    { value: 'phone',    label: t.payout.pix_type_phone,   placeholder: t.payout.pix_ph_phone  },
    { value: 'random',   label: t.payout.pix_type_random,  placeholder: t.payout.pix_ph_random },
  ]

  const activePix = pixTypes.find((p) => p.value === pixKeyType)!

  // ── Envio ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!kycApproved || !pixKey.trim() || submitting || success) return
    setSubmitting(true)
    // Simula chamada à API de Saque (substituir por `fetch('/api/wallet/withdraw')`)
    await new Promise<void>((r) => setTimeout(r, 2_000))
    setSubmitting(false)
    setSuccess(true)
  }

  // ── Estado de Sucesso ─────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-6 py-20 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-100">
          <CheckCircle2 className="size-10 text-emerald-500" strokeWidth={1.5} />
        </span>
        <div>
          <h2 className="font-heading text-2xl font-bold text-navy">{t.payout.cta_success}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t.payout.success_desc}</p>
        </div>
        <div className="w-full rounded-2xl border border-border bg-card p-5 text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t.payout.net_label}
          </p>
          <p className="mt-1 text-3xl font-extrabold text-gold">{formatBRL(makerShare)}</p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <KeyRound className="size-3.5" />
            {activePix.label}: <span className="font-medium text-navy">{pixKey}</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-8">

      {/* Cabeçalho */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">{t.payout.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.payout.subtitle}</p>
      </div>

      {/* ── Cards de Split 85/15 ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {splitCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className={cn(
                'flex flex-col gap-3 rounded-2xl border p-5 shadow-sm',
                card.accent,
              )}
            >
              <span className={cn('flex size-10 items-center justify-center rounded-xl', card.iconBg)}>
                <Icon className={cn('size-5', card.iconColor)} strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {card.label}
                </p>
                <p className={cn('mt-1 text-2xl font-extrabold', card.valueColor)}>
                  {card.value}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">{card.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Nota de distribuição */}
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <TrendingDown className="size-3.5 shrink-0 text-gold" />
        {t.payout.split_note}
      </p>

      {/* ── Alerta KYC (visível somente se pendente) ─────────────────────── */}
      {!kycApproved && (
        <div className="flex gap-4 rounded-2xl border border-amber-300/60 bg-amber-50 p-5">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-500" strokeWidth={1.75} />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-bold text-amber-800">{t.payout.kyc_alert_title}</p>
            <p className="text-xs leading-relaxed text-amber-700">{t.payout.kyc_alert_body}</p>
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-amber-400 bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-200"
            >
              <KeyRound className="size-3.5" />
              {t.payout.kyc_alert_cta}
            </button>
          </div>
        </div>
      )}

      {/* ── Formulário PIX ───────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6"
      >
        <h2 className="flex items-center gap-2 text-base font-bold text-navy">
          <KeyRound className="size-4 text-gold" strokeWidth={1.75} />
          {t.payout.pix_title}
        </h2>

        {/* Selector de tipo de chave */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t.payout.pix_type_label}
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {pixTypes.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => { setPixKeyType(value); setPixKey('') }}
                className={cn(
                  'rounded-xl border-2 py-2.5 px-3 text-center text-xs font-semibold transition-all',
                  pixKeyType === value
                    ? 'border-gold bg-gold/10 text-navy shadow-sm'
                    : 'border-border text-muted-foreground hover:border-gold/40 hover:text-navy',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Input da chave */}
        <div>
          <label
            htmlFor="pix-key-input"
            className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          >
            {t.payout.pix_key_label}
          </label>
          <input
            id="pix-key-input"
            type="text"
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
            placeholder={activePix.placeholder}
            disabled={!kycApproved}
            className={cn(
              'w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-navy outline-none transition-colors',
              'placeholder:text-muted-foreground/60',
              'focus:border-gold focus:ring-2 focus:ring-gold/20',
              !kycApproved && 'cursor-not-allowed opacity-50',
            )}
          />
        </div>

        {/* Resumo do saque antes do envio */}
        {kycApproved && pixKey.trim() && (
          <div className="rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-xs text-navy">
            <span className="font-semibold">Resumo: </span>
            {formatBRL(makerShare)} via PIX · {activePix.label}:{' '}
            <span className="font-medium">{pixKey}</span>
          </div>
        )}

        {/* Botão de envio — travado pelo KYC Guard */}
        <button
          type="submit"
          disabled={!kycApproved || !pixKey.trim() || submitting}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold shadow-md transition-all',
            kycApproved && pixKey.trim() && !submitting
              ? 'bg-gradient-to-r from-gold/80 to-gold text-navy hover:opacity-90 active:scale-[.98]'
              : 'cursor-not-allowed bg-muted text-muted-foreground opacity-60',
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t.payout.cta_processing}
            </>
          ) : (
            t.payout.cta_submit
          )}
        </button>
      </form>
    </div>
  )
}
