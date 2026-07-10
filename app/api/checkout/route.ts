import { NextRequest, NextResponse } from 'next/server'
import { stripe, TIER_PRICE_IDS } from '@/lib/stripe'

/**
 * POST /api/checkout
 *
 * Cria uma Stripe Checkout Session para assinatura de um Maker.
 *
 * Body (JSON):
 *   { makerId: string, planName: string, userId?: string }
 *
 * Response:
 *   { url: string } — URL da Stripe Checkout Session hospedada
 *
 * Segurança:
 *   - STRIPE_SECRET_KEY está em variável de ambiente server-only.
 *   - makerId e userId são armazenados em session.metadata para o webhook.
 *   - success_url inclui session_id para validação opcional no retorno.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { makerId, planName, userId } = body as {
      makerId: string
      planName: string
      userId?: string
    }

    if (!makerId || !planName) {
      return NextResponse.json(
        { error: 'makerId e planName são obrigatórios.' },
        { status: 400 },
      )
    }

    const priceId = TIER_PRICE_IDS[planName]

    if (!priceId) {
      return NextResponse.json(
        { error: `Plano inválido: "${planName}". Configure STRIPE_PRICE_* no .env.local.` },
        { status: 400 },
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],

      // Metadados rastreáveis pelo webhook
      metadata: {
        makerId,
        planName,
        ...(userId ? { userId } : {}),
      },

      // Subscrição também herda os metadados para rastreamento contínuo
      subscription_data: {
        metadata: {
          makerId,
          planName,
          ...(userId ? { userId } : {}),
        },
      },

      // Retornos após pagamento
      success_url: `${appUrl}/?checkout_success=1&maker_id=${makerId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${appUrl}/?checkout_cancelled=1`,

      // Habilita cupons e código promocional no checkout
      allow_promotion_codes: true,

      // Localização automática (pt-BR para Brasil)
      locale: 'pt-BR',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro inesperado no checkout.'
    console.error('[POST /api/checkout]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
