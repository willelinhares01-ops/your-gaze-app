import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { runPaymentSplit } from '@/lib/financial-engine'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

/**
 * POST /api/webhooks/stripe
 *
 * Recebe e processa eventos do Stripe via webhook.
 * CRÍTICO: valida a assinatura do evento com STRIPE_WEBHOOK_SECRET antes
 * de processar qualquer dado. Isso garante que apenas o Stripe pode acionar
 * esta rota — proteção contra replay attacks e spoofing.
 *
 * Eventos tratados:
 *   - checkout.session.completed    → assinatura confirmada, libera conteúdo
 *   - invoice.payment_succeeded     → executa split financeiro (inicial + recorrente)
 *   - customer.subscription.deleted → assinatura cancelada, revoga acesso
 *
 * Para testar localmente:
 *   stripe listen --forward-to localhost:3000/api/webhooks/stripe
 */

// Cliente Supabase com permissão de service_role — NUNCA exposto ao client.
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY // chave secreta de service_role

  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados.')
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  })
}

// ─── Handler principal ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ''

  // 1. Validar assinatura criptográfica do evento
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Assinatura inválida.'
    console.error('[Webhook] Falha na validação da assinatura:', msg)
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  console.log(`[Webhook] Evento recebido: ${event.type} — id: ${event.id}`)

  // 2. Despachar para o handler correto
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      default:
        // Outros eventos — ignorados silenciosamente
        break
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao processar evento.'
    console.error(`[Webhook] Erro ao processar ${event.type}:`, msg)
    // Retorna 500 para que o Stripe reenvie o evento (retry policy).
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

// ─── checkout.session.completed ──────────────────────────────────────────────
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { makerId, planName, userId } = session.metadata ?? {}

  if (!makerId) {
    console.warn('[Webhook] checkout.session.completed sem makerId nos metadados.')
    return
  }

  const supabase = getSupabaseAdmin()

  const { error } = await supabase.from('subscriptions').upsert(
    {
      user_id:        userId ?? session.customer_email ?? 'unknown',
      maker_id:       makerId,
      plan:           planName ?? 'Premium',
      stripe_session: session.id,
      stripe_customer:session.customer as string,
      status:         'active',
      activated_at:   new Date().toISOString(),
    },
    // Atualiza se já existir (renovação de plano)
    { onConflict: 'user_id,maker_id' },
  )

  if (error) {
    console.error('[Webhook] Erro ao gravar subscription no Supabase:', error.message)
    throw new Error(error.message)
  }

  console.log(`[Webhook] Assinatura ativada — userId: ${userId}, makerId: ${makerId}, plan: ${planName}`)
}

// ─── invoice.payment_succeeded ────────────────────────────────────────────────
/**
 * Acionado em TODA fatura paga com sucesso — inclui o pagamento inicial de uma
 * nova assinatura E todas as renovações automáticas subsequentes.
 *
 * É aqui que o Motor Financeiro é chamado para:
 *   1. Calcular o split (gateway / plataforma / maker / fundador)
 *   2. Creditar a carteira do Maker no Supabase
 *   3. Creditar comissão vitalícia do Maker Fundador (se elegível)
 *   4. Registrar auditoria em payment_splits
 *
 * O `invoice.id` é usado como `referenceId` garantindo idempotência completa:
 * se o Stripe reenviar o evento, o split não é processado duas vezes.
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // makerId é gravado nos metadados da assinatura pelo /api/checkout.
  // Na API Stripe atual, os metadados ficam em invoice.parent.subscription_details.metadata.
  // Fallback em invoice.metadata para compatibilidade com one-time invoices.
  const subscriptionMeta = invoice.parent?.subscription_details?.metadata
  const { makerId } = (subscriptionMeta ?? invoice.metadata ?? {}) as Record<string, string>

  if (!makerId) {
    console.warn('[Webhook] invoice.payment_succeeded sem makerId nos metadados — invoice:', invoice.id)
    return
  }

  // amount_paid é em centavos, moeda da invoice (usamos como grossCents)
  const grossCents = invoice.amount_paid

  if (!grossCents || grossCents <= 0) {
    console.warn('[Webhook] invoice.payment_succeeded com valor zero — ignorado:', invoice.id)
    return
  }

  await runPaymentSplit({
    referenceId: invoice.id,
    grossCents,
    makerId,
  })

  console.log(`[Webhook] Split financeiro executado — invoice: ${invoice.id} | maker: ${makerId}`)
}

// ─── customer.subscription.deleted ───────────────────────────────────────────
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { makerId, userId } = subscription.metadata ?? {}

  if (!makerId || !userId) {
    console.warn('[Webhook] subscription.deleted sem makerId/userId nos metadados.')
    return
  }

  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .match({ user_id: userId, maker_id: makerId })

  if (error) {
    console.error('[Webhook] Erro ao cancelar subscription no Supabase:', error.message)
    throw new Error(error.message)
  }

  console.log(`[Webhook] Assinatura cancelada — userId: ${userId}, makerId: ${makerId}`)
}
