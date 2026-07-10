/**
 * lib/stripe.ts — Singleton server-side do Stripe SDK.
 *
 * SEGURANÇA: este módulo usa STRIPE_SECRET_KEY (sem prefixo NEXT_PUBLIC_).
 * Ele nunca é importado por componentes client-side — apenas por Route Handlers
 * e Server Actions que rodam exclusivamente no Node.js.
 *
 * O padrão de singleton com `globalThis` evita instâncias duplicadas
 * durante o hot-reload do Next.js dev server.
 */

import Stripe from 'stripe'

const globalForStripe = globalThis as unknown as { stripe?: Stripe }

export const stripe: Stripe =
  globalForStripe.stripe ??
  new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
    apiVersion: '2026-05-27.dahlia',
    typescript: true,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForStripe.stripe = stripe
}

// ─── Mapeamento de tier → Price ID ───────────────────────────────────────────
// Configure os Price IDs reais no Stripe Dashboard e coloque no .env.local.
export const TIER_PRICE_IDS: Record<string, string> = {
  Premium:          process.env.STRIPE_PRICE_PREMIUM  ?? '',
  'Premium Gold':   process.env.STRIPE_PRICE_GOLD     ?? '',
  'Premium Diamond':process.env.STRIPE_PRICE_DIAMOND  ?? '',
}
