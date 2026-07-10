import { NextRequest, NextResponse } from 'next/server'
import { createClient }             from '@supabase/supabase-js'
import { stripe }                   from '@/lib/stripe'
import {
  requestWithdrawal,
  MINIMUM_WITHDRAWAL_CENTS,
  type WithdrawalError,
} from '@/lib/financial-engine'

/**
 * POST /api/wallet/withdraw
 *
 * Inicia um saque da carteira virtual do Maker para sua conta bancária
 * via Stripe Payouts (Stripe Connect).
 *
 * ─── Autenticação ────────────────────────────────────────────────────────────
 * Requer o header `Authorization: Bearer <supabase_access_token>`.
 * O token é validado pelo Supabase usando a chave ANON — se inválido ou
 * expirado, a rota retorna 401 antes de qualquer operação financeira.
 *
 * ─── Body (JSON) ─────────────────────────────────────────────────────────────
 *   { amountCents: number }  — valor em centavos, mínimo 5000 (R$ 50,00)
 *
 * ─── Respostas ───────────────────────────────────────────────────────────────
 *   200  { withdrawalId, stripePayoutId, amountCents, status: 'PROCESSING' }
 *   400  { error: WithdrawalError, message: string }
 *   401  { error: 'UNAUTHORIZED' }
 *   422  { error: 'INVALID_INPUT', details: string }
 *   500  { error: 'INTERNAL_ERROR' }
 *
 * ─── Pré-requisitos para o Maker ─────────────────────────────────────────────
 *   1. KYC aprovado (Yoti)
 *   2. Conta Stripe Connect configurada (makers.stripe_connect_id preenchido)
 *   3. Saldo suficiente na carteira (wallets.balance >= amountCents)
 */

// ─── Mensagens de erro amigáveis ──────────────────────────────────────────────
const ERROR_MESSAGES: Record<WithdrawalError, string> = {
  WALLET_NOT_FOUND:               'Carteira não encontrada. Entre em contato com o suporte.',
  INSUFFICIENT_FUNDS:             'Saldo insuficiente para o valor solicitado.',
  BELOW_MINIMUM_WITHDRAWAL:       `O valor mínimo de saque é R$ ${(MINIMUM_WITHDRAWAL_CENTS / 100).toFixed(2)}.`,
  STRIPE_CONNECT_NOT_CONFIGURED:  'Sua conta bancária ainda não foi vinculada. Complete o onboarding financeiro.',
  STRIPE_PAYOUT_FAILED:           'Falha ao processar o saque via gateway. Seu saldo foi restaurado. Tente novamente.',
}

// ─── Utilitário de autenticação ───────────────────────────────────────────────
async function resolveAuthUser(authHeader: string | null): Promise<string | null> {
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)
  const url   = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key   = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return null

  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) return null
  return data.user.id
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── 1. Autenticação ──────────────────────────────────────────────────────
  const userId = await resolveAuthUser(req.headers.get('authorization'))

  if (!userId) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  // ── 2. Validação do body ─────────────────────────────────────────────────
  let amountCents: number

  try {
    const body = await req.json()
    amountCents = body?.amountCents

    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', details: 'amountCents deve ser um inteiro positivo.' },
        { status: 422 },
      )
    }

    if (amountCents < MINIMUM_WITHDRAWAL_CENTS) {
      return NextResponse.json(
        {
          error:   'BELOW_MINIMUM_WITHDRAWAL' as WithdrawalError,
          message: ERROR_MESSAGES.BELOW_MINIMUM_WITHDRAWAL,
        },
        { status: 400 },
      )
    }
  } catch {
    return NextResponse.json(
      { error: 'INVALID_INPUT', details: 'Body JSON malformado.' },
      { status: 422 },
    )
  }

  // ── 3. Executa o Motor de Saque ──────────────────────────────────────────
  try {
    const result = await requestWithdrawal({ userId, amountCents, stripe })

    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    const code = (err as { code?: string }).code as WithdrawalError | undefined

    // Erro de domínio conhecido → 400 com mensagem amigável
    if (code && code in ERROR_MESSAGES) {
      console.warn(`[POST /api/wallet/withdraw] Erro de domínio — userId: ${userId} | code: ${code}`)
      return NextResponse.json(
        { error: code, message: ERROR_MESSAGES[code] },
        { status: 400 },
      )
    }

    // Erro inesperado → 500
    const message = err instanceof Error ? err.message : 'Erro desconhecido.'
    console.error(`[POST /api/wallet/withdraw] Erro inesperado — userId: ${userId}`, message)

    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
