'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Crown, Gem, Lock, Loader2, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react'
import { useApp } from '@/components/app-context'
import { useDict } from '@/lib/locale-context'

// ─── Props ────────────────────────────────────────────────────────────────────
export interface CheckoutModalProps {
  plan: string
  price: string
  maker: string
  makerId: string
  makerAvatar?: string
  onClose: () => void
}

// ─── Ícone por tier ───────────────────────────────────────────────────────────
function TierIcon({ plan }: { plan: string }) {
  if (plan === 'Premium Diamond')
    return <Gem className="size-5 text-[#7c3aed]" />
  return <Crown className="size-5 text-gold" />
}

/**
 * CheckoutModal — Integração real com Stripe Checkout.
 *
 * Fluxo:
 *   1. Usuário clica "Pagar com Stripe"
 *   2. POST /api/checkout com { makerId, planName, userId }
 *   3. API retorna { url } da Stripe Checkout Session hospedada
 *   4. window.location.href redireciona para o ambiente seguro do Stripe
 *   5. Pós-pagamento: Stripe dispara webhook → atualiza Supabase
 *   6. success_url retorna ao app com ?checkout_success=1&maker_id=xxx
 *   7. App detecta os params e libera o conteúdo granularmente
 */
export function CheckoutModal({
  plan,
  price,
  maker,
  makerId,
  makerAvatar,
  onClose,
}: CheckoutModalProps) {
  const { user } = useApp()
  const t = useDict()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePay = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          makerId,
          planName: plan,
          userId: user?.id ?? null,
        }),
      })

      const data = (await res.json()) as { url?: string; error?: string }

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? 'Não foi possível iniciar o checkout. Tente novamente.')
      }

      // Redireciona para o ambiente seguro e hospedado do Stripe
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 px-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-2xl">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="font-heading text-xl text-navy">{t.checkout.titulo}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.checkout.fechar}
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-navy"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-6">

          {/* ── Cartão do plano ──────────────────────────────────────────────── */}
          <div className="flex items-center gap-4 rounded-xl border border-gold/30 bg-gold/5 p-4">
            {/* Avatar do maker */}
            <div className="relative size-14 shrink-0 overflow-hidden rounded-full ring-2 ring-gold/50">
              {makerAvatar ? (
                <Image src={makerAvatar} alt={maker} fill sizes="56px" className="object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center bg-gold/20 text-xl font-semibold text-gold">
                  {maker[0]?.toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 leading-tight">
              <p className="text-xs text-muted-foreground">{maker}</p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <TierIcon plan={plan} />
                <span className="font-heading text-lg text-navy">{plan}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{t.checkout.total_mensal}</p>
            </div>

            <span className="font-heading text-2xl font-bold text-gold">{price}</span>
          </div>

          {/* ── Aviso de redirecionamento ─────────────────────────────────────── */}
          <div className="rounded-lg bg-secondary px-4 py-3 text-xs text-muted-foreground">
            <Lock className="mb-1 size-3.5 inline-block text-navy/60" />{' '}
            {t.checkout.redirect_aviso}
          </div>

          {/* ── Erro de API ───────────────────────────────────────────────────── */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-xs text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── CTA principal ─────────────────────────────────────────────────── */}
          <button
            type="button"
            onClick={handlePay}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-navy py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t.checkout.processando}
              </>
            ) : (
              <>
                {t.checkout.pagar} {price}
                <ArrowRight className="size-4" />
              </>
            )}
          </button>

          {/* ── Selos de segurança ────────────────────────────────────────────── */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            {t.checkout.seguro_stripe}
          </div>
        </div>
      </div>
    </div>
  )
}
