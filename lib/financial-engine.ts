/**
 * lib/financial-engine.ts — Motor Financeiro Core do YOUR GAZE
 *
 * Responsável por:
 *  1. Calcular o split de cada pagamento (gateway → plataforma → maker → recrutador)
 *  2. Creditar carteiras no Supabase (wallets + wallet_transactions)
 *  3. Aplicar a Regra do Maker Fundador (comissão vitalícia de 2% para Makers #1–#1000)
 *  4. Processar saques (cashout) com lock pessimista e Stripe Payouts
 *
 * SEGURANÇA:
 *  - Só é importado por Route Handlers (Node.js runtime) — jamais por código client-side.
 *  - Usa o cliente Supabase com service_role para operações privilegiadas.
 *  - Toda operação é idempotente via referenceId (evita crédito duplo em retries do Stripe).
 *  - Saques usam lock pessimista (SELECT FOR UPDATE via RPC) para evitar double-spend.
 *
 * ─── SQL MIGRATION (execute no Supabase Studio / CLI) ────────────────────────
 *
 *  -- Perfis de Maker (recrutador + selo fundador + conta Stripe Connect para saques)
 *  CREATE TABLE IF NOT EXISTS makers (
 *    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *    user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 *    recruiter_id         UUID REFERENCES makers(id),
 *    is_founder           BOOLEAN NOT NULL DEFAULT FALSE,
 *    stripe_connect_id    TEXT,           -- ID da conta Stripe Connect (ex: acct_xxx)
 *    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *    UNIQUE (user_id)
 *  );
 *
 *  -- Carteiras (saldo em centavos para evitar erro de ponto flutuante)
 *  CREATE TABLE IF NOT EXISTS wallets (
 *    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *    user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 *    balance    BIGINT NOT NULL DEFAULT 0,  -- centavos (BRL)
 *    currency   TEXT NOT NULL DEFAULT 'BRL',
 *    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *    UNIQUE (user_id)
 *  );
 *
 *  -- Ledger de todas as movimentações financeiras
 *  CREATE TABLE IF NOT EXISTS wallet_transactions (
 *    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *    user_id      UUID NOT NULL REFERENCES auth.users(id),
 *    amount       BIGINT NOT NULL,
 *    type         TEXT NOT NULL,               -- 'Content_Sale' | 'Founder_Bonus' | 'Withdrawal'
 *    reference_id TEXT NOT NULL,
 *    metadata     JSONB,
 *    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *    UNIQUE (reference_id, type, user_id)
 *  );
 *
 *  -- Auditoria de cada split executado
 *  CREATE TABLE IF NOT EXISTS payment_splits (
 *    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *    reference_id     TEXT NOT NULL UNIQUE,
 *    maker_id         UUID NOT NULL,
 *    gross_cents      BIGINT NOT NULL,
 *    gateway_fee_cents BIGINT NOT NULL,
 *    net_cents        BIGINT NOT NULL,
 *    maker_cents      BIGINT NOT NULL,
 *    platform_cents   BIGINT NOT NULL,
 *    recruiter_cents  BIGINT NOT NULL DEFAULT 0,
 *    recruiter_id     UUID,
 *    status           TEXT NOT NULL DEFAULT 'completed',
 *    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *  );
 *
 *  -- Registros de saques solicitados pelos Makers
 *  CREATE TABLE IF NOT EXISTS withdrawal_requests (
 *    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *    user_id             UUID NOT NULL REFERENCES auth.users(id),
 *    amount_cents        BIGINT NOT NULL,
 *    status              TEXT NOT NULL DEFAULT 'PENDING',
 *                        -- PENDING | PROCESSING | COMPLETED | FAILED
 *    stripe_payout_id    TEXT,           -- ID do Payout no Stripe
 *    stripe_connect_id   TEXT,           -- conta Connect de destino
 *    failure_reason      TEXT,
 *    requested_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *  );
 *
 *  -- RPC com lock pessimista para debitar saldo e criar o saque atomicamente.
 *  -- SECURITY DEFINER permite que o client anon execute com privilégios de service_role.
 *  CREATE OR REPLACE FUNCTION atomic_debit_and_create_withdrawal(
 *    p_user_id     UUID,
 *    p_amount_cents BIGINT
 *  )
 *  RETURNS UUID
 *  LANGUAGE plpgsql
 *  SECURITY DEFINER
 *  SET search_path = public
 *  AS $$
 *  DECLARE
 *    v_balance     BIGINT;
 *    v_withdrawal_id UUID;
 *  BEGIN
 *    -- 1. Lock pessimista: bloqueia a linha até o fim da transação
 *    SELECT balance INTO v_balance
 *    FROM wallets
 *    WHERE user_id = p_user_id
 *    FOR UPDATE;
 *
 *    IF NOT FOUND THEN
 *      RAISE EXCEPTION 'WALLET_NOT_FOUND';
 *    END IF;
 *
 *    IF p_amount_cents < 5000 THEN
 *      RAISE EXCEPTION 'BELOW_MINIMUM_WITHDRAWAL';
 *    END IF;
 *
 *    IF v_balance < p_amount_cents THEN
 *      RAISE EXCEPTION 'INSUFFICIENT_FUNDS';
 *    END IF;
 *
 *    -- 2. Debita o saldo imediatamente
 *    UPDATE wallets
 *    SET balance    = balance - p_amount_cents,
 *        updated_at = NOW()
 *    WHERE user_id = p_user_id;
 *
 *    -- 3. Cria o registro de saque em PENDING
 *    INSERT INTO withdrawal_requests (user_id, amount_cents, status, requested_at)
 *    VALUES (p_user_id, p_amount_cents, 'PENDING', NOW())
 *    RETURNING id INTO v_withdrawal_id;
 *
 *    -- 4. Registra no ledger como débito (valor negativo)
 *    INSERT INTO wallet_transactions (user_id, amount, type, reference_id)
 *    VALUES (p_user_id, -p_amount_cents, 'Withdrawal', v_withdrawal_id::TEXT);
 *
 *    RETURN v_withdrawal_id;
 *  END;
 *  $$;
 *
 *  -- Função auxiliar de incremento de saldo (usada pelo runPaymentSplit)
 *  CREATE OR REPLACE FUNCTION increment_wallet_balance(
 *    p_user_id UUID,
 *    p_amount  BIGINT
 *  )
 *  RETURNS VOID
 *  LANGUAGE sql
 *  SECURITY DEFINER
 *  SET search_path = public
 *  AS $$
 *    UPDATE wallets
 *    SET balance    = balance + p_amount,
 *        updated_at = NOW()
 *    WHERE user_id = p_user_id;
 *  $$;
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ─── Constantes financeiras ───────────────────────────────────────────────────
/** Taxa cobrada pelo gateway de pagamento (ex.: cartão de crédito). */
const GATEWAY_FEE_RATE     = 0.03   // 3 %
/** Parte da plataforma YOUR GAZE sobre o valor líquido. */
const PLATFORM_FEE_RATE    = 0.15   // 15 %
/** Parte do Maker sobre o valor líquido. */
const MAKER_SHARE_RATE     = 0.85   // 85 %
/** Comissão vitalícia do Maker Fundador sobre o valor líquido. Sai da parte da plataforma. */
const FOUNDER_COMMISSION_RATE = 0.02 // 2 %

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Todos os valores em centavos (BIGINT no Supabase) para evitar erros de float. */
export type SplitResult = {
  grossCents:        number
  gatewayFeeCents:   number
  netCents:          number
  makerCents:        number
  platformCents:     number
  recruiterCents:    number
  recruiterId:       string | null
}

type MakerRow = {
  id:           string
  user_id:      string
  recruiter_id: string | null
  is_founder:   boolean
}

// ─── Cliente Supabase admin (service_role) ────────────────────────────────────
function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('[FinancialEngine] NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes.')
  }

  return createClient(url, key, { auth: { persistSession: false } })
}

// ─── Cálculo do Split ─────────────────────────────────────────────────────────
/**
 * Calcula todos os valores de um split financeiro.
 *
 * @param grossCents - Valor bruto cobrado do comprador (em centavos).
 * @param hasFounderRecruiter - Se o Maker foi indicado por um Maker Fundador.
 */
export function calculateSplit(
  grossCents: number,
  hasFounderRecruiter: boolean,
): SplitResult {
  // Usa inteiros arredondados para evitar problemas de ponto flutuante.
  const gatewayFeeCents = Math.round(grossCents * GATEWAY_FEE_RATE)
  const netCents        = grossCents - gatewayFeeCents
  const makerCents      = Math.round(netCents * MAKER_SHARE_RATE)

  let platformCents   = netCents - makerCents
  let recruiterCents  = 0

  if (hasFounderRecruiter) {
    recruiterCents = Math.round(netCents * FOUNDER_COMMISSION_RATE)
    // A comissão do Fundador sai exclusivamente da parte da plataforma.
    platformCents  = Math.max(0, platformCents - recruiterCents)
  }

  return { grossCents, gatewayFeeCents, netCents, makerCents, platformCents, recruiterCents, recruiterId: null }
}

// ─── Busca de Maker e Recrutador ──────────────────────────────────────────────
/**
 * Resolve o perfil do Maker e, se existir, o seu recrutador.
 * Retorna null para ambos se o makerId não for encontrado.
 */
async function resolveMakerAndRecruiter(
  supabase: SupabaseClient,
  makerId: string,
): Promise<{ maker: MakerRow | null; recruiter: MakerRow | null }> {
  const { data: maker, error } = await supabase
    .from('makers')
    .select('id, user_id, recruiter_id, is_founder')
    .eq('user_id', makerId)
    .single()

  if (error || !maker) {
    console.warn('[FinancialEngine] Maker não encontrado no DB:', makerId)
    return { maker: null, recruiter: null }
  }

  if (!maker.recruiter_id) return { maker, recruiter: null }

  const { data: recruiter } = await supabase
    .from('makers')
    .select('id, user_id, recruiter_id, is_founder')
    .eq('id', maker.recruiter_id)
    .single()

  return { maker, recruiter: recruiter ?? null }
}

// ─── Crédito em Carteira (idempotente) ───────────────────────────────────────
/**
 * Credita `amountCents` na carteira do usuário.
 * A constraint UNIQUE (reference_id, type, user_id) garante idempotência:
 * se o Stripe reenviar o mesmo evento, o crédito não é duplicado.
 */
async function creditWallet(
  supabase: SupabaseClient,
  userId: string,
  amountCents: number,
  type: string,
  referenceId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  // Garante que a carteira existe (upsert)
  const { error: walletErr } = await supabase
    .from('wallets')
    .upsert({ user_id: userId, balance: 0, currency: 'BRL' }, { onConflict: 'user_id', ignoreDuplicates: true })

  if (walletErr) throw new Error(`[FinancialEngine] Falha ao criar wallet: ${walletErr.message}`)

  // Insere a transação (idempotente — falha silenciosa em duplicata)
  const { error: txErr } = await supabase.from('wallet_transactions').insert({
    user_id:      userId,
    amount:       amountCents,
    type,
    reference_id: referenceId,
    metadata:     metadata ?? null,
  })

  if (txErr) {
    // Código 23505 = violação de UNIQUE → crédito já processado → seguro ignorar.
    if (txErr.code === '23505') {
      console.info(`[FinancialEngine] Crédito já processado (idempotente) — ref: ${referenceId}`)
      return
    }
    throw new Error(`[FinancialEngine] Falha ao registrar wallet_transaction: ${txErr.message}`)
  }

  // Atualiza o saldo agregado da carteira
  const { error: balErr } = await supabase.rpc('increment_wallet_balance', {
    p_user_id: userId,
    p_amount:  amountCents,
  })

  if (balErr) throw new Error(`[FinancialEngine] Falha ao atualizar saldo: ${balErr.message}`)
}

// ─── Função principal exportada ───────────────────────────────────────────────
/**
 * Executa o Motor Financeiro completo para um pagamento confirmado.
 *
 * @param referenceId  - ID único da transação (invoice_id ou payment_intent_id).
 * @param grossCents   - Valor bruto cobrado (em centavos).
 * @param makerId      - user_id do Maker que gerou a receita.
 */
export async function runPaymentSplit(params: {
  referenceId: string
  grossCents:  number
  makerId:     string
}): Promise<SplitResult> {
  const { referenceId, grossCents, makerId } = params
  const supabase = getSupabaseAdmin()

  // ── Idempotência ao nível do split ────────────────────────────────────────
  // Se o split já foi processado, retorna os dados gravados sem re-executar.
  const { data: existing } = await supabase
    .from('payment_splits')
    .select('*')
    .eq('reference_id', referenceId)
    .maybeSingle()

  if (existing) {
    console.info(`[FinancialEngine] Split já processado — ref: ${referenceId}`)
    return {
      grossCents:      existing.gross_cents,
      gatewayFeeCents: existing.gateway_fee_cents,
      netCents:        existing.net_cents,
      makerCents:      existing.maker_cents,
      platformCents:   existing.platform_cents,
      recruiterCents:  existing.recruiter_cents,
      recruiterId:     existing.recruiter_id,
    }
  }

  // ── Resolver Maker + Recrutador Fundador ──────────────────────────────────
  const { maker, recruiter } = await resolveMakerAndRecruiter(supabase, makerId)
  const hasFounderRecruiter  = !!(recruiter?.is_founder)

  const split = calculateSplit(grossCents, hasFounderRecruiter)
  split.recruiterId = recruiter?.user_id ?? null

  // ── Creditar Maker ────────────────────────────────────────────────────────
  await creditWallet(supabase, makerId, split.makerCents, 'Content_Sale', referenceId, {
    gross: grossCents,
    net:   split.netCents,
  })

  // ── Creditar Recrutador Fundador (se elegível) ────────────────────────────
  if (hasFounderRecruiter && recruiter && split.recruiterCents > 0) {
    await creditWallet(
      supabase,
      recruiter.user_id,
      split.recruiterCents,
      'Founder_Bonus',
      referenceId,
      { source_maker_id: makerId, gross: grossCents },
    )

    console.log(
      `[FinancialEngine] Comissão Fundador creditada — recrutador: ${recruiter.user_id}` +
      ` | R$ ${(split.recruiterCents / 100).toFixed(2)}`,
    )
  }

  // ── Registrar auditoria do split ──────────────────────────────────────────
  const { error: splitErr } = await supabase.from('payment_splits').insert({
    reference_id:      referenceId,
    maker_id:          maker?.id ?? makerId,
    gross_cents:       split.grossCents,
    gateway_fee_cents: split.gatewayFeeCents,
    net_cents:         split.netCents,
    maker_cents:       split.makerCents,
    platform_cents:    split.platformCents,
    recruiter_cents:   split.recruiterCents,
    recruiter_id:      split.recruiterId,
    status:            'completed',
  })

  if (splitErr && splitErr.code !== '23505') {
    throw new Error(`[FinancialEngine] Falha ao registrar payment_split: ${splitErr.message}`)
  }

  console.log(
    `[FinancialEngine] Split concluído — ref: ${referenceId}` +
    ` | bruto: R$ ${(grossCents / 100).toFixed(2)}` +
    ` | maker: R$ ${(split.makerCents / 100).toFixed(2)}` +
    ` | plataforma: R$ ${(split.platformCents / 100).toFixed(2)}` +
    (hasFounderRecruiter ? ` | fundador: R$ ${(split.recruiterCents / 100).toFixed(2)}` : ''),
  )

  return split
}

// ═════════════════════════════════════════════════════════════════════════════
// CASHOUT — API de Saque
// ═════════════════════════════════════════════════════════════════════════════

/** Valor mínimo de saque em centavos (R$ 50,00). */
export const MINIMUM_WITHDRAWAL_CENTS = 5_000

/** Erros de domínio retornados pelo motor de saque. */
export type WithdrawalError =
  | 'WALLET_NOT_FOUND'
  | 'INSUFFICIENT_FUNDS'
  | 'BELOW_MINIMUM_WITHDRAWAL'
  | 'STRIPE_CONNECT_NOT_CONFIGURED'
  | 'STRIPE_PAYOUT_FAILED'

/** Resultado de um saque bem-sucedido. */
export type WithdrawalResult = {
  withdrawalId:  string   // UUID do withdrawal_requests
  stripePayoutId: string  // ID do Payout no Stripe
  amountCents:   number
  status:        'PROCESSING'
}

// ─── Busca a conta Stripe Connect do Maker ────────────────────────────────────
async function getMakerStripeConnectId(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from('makers')
    .select('stripe_connect_id')
    .eq('user_id', userId)
    .single()

  return data?.stripe_connect_id ?? null
}

// ─── Função principal de saque ────────────────────────────────────────────────
/**
 * Solicita um saque para a conta bancária do Maker via Stripe Payouts.
 *
 * Fluxo ACID:
 *  1. RPC `atomic_debit_and_create_withdrawal` executa com SELECT FOR UPDATE:
 *     valida saldo mínimo → debita carteira → cria withdrawal_request em PENDING
 *     (tudo numa única transação PostgreSQL)
 *  2. Stripe Payouts envia o dinheiro para a conta Connect do Maker
 *  3. withdrawal_request é atualizado para PROCESSING com o stripe_payout_id
 *
 * Em caso de falha no Stripe (pós-débito), o status fica como FAILED e o
 * saldo é reestabelecido via wallet_transaction de estorno — evitando perda
 * de fundos do Maker.
 *
 * @param userId      - auth.users.id do Maker autenticado
 * @param amountCents - valor solicitado em centavos
 * @param stripe      - instância do Stripe SDK (injetada para testabilidade)
 */
export async function requestWithdrawal(params: {
  userId:      string
  amountCents: number
  stripe:      import('stripe').default
}): Promise<WithdrawalResult> {
  const { userId, amountCents, stripe } = params
  const supabase = getSupabaseAdmin()

  // ── 1. Validação de entrada ────────────────────────────────────────────────
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw Object.assign(new Error('BELOW_MINIMUM_WITHDRAWAL'), { code: 'BELOW_MINIMUM_WITHDRAWAL' })
  }

  // ── 2. Busca ID da conta Stripe Connect (exige KYC completo) ──────────────
  const stripeConnectId = await getMakerStripeConnectId(supabase, userId)

  if (!stripeConnectId) {
    throw Object.assign(
      new Error('STRIPE_CONNECT_NOT_CONFIGURED'),
      { code: 'STRIPE_CONNECT_NOT_CONFIGURED' },
    )
  }

  // ── 3. Transação ACID via RPC (debita saldo + cria withdrawal em PENDING) ──
  //    O lock pessimista `SELECT FOR UPDATE` dentro da RPC impede double-spend
  //    em cliques simultâneos.
  const { data: withdrawalId, error: rpcError } = await supabase.rpc(
    'atomic_debit_and_create_withdrawal',
    { p_user_id: userId, p_amount_cents: amountCents },
  )

  if (rpcError) {
    // O PostgreSQL RAISE EXCEPTION propaga a mensagem como erro do RPC.
    const code = rpcError.message as WithdrawalError
    throw Object.assign(new Error(code), { code })
  }

  if (!withdrawalId) {
    throw new Error('[FinancialEngine] RPC retornou ID nulo inesperadamente.')
  }

  // ── 4. Iniciar Payout no Stripe ───────────────────────────────────────────
  let stripePayoutId: string

  try {
    // Stripe Payouts envia o valor para a conta bancária atrelada à Connect.
    // amount em centavos, currency em minúsculas.
    const payout = await stripe.payouts.create(
      {
        amount:   amountCents,
        currency: 'brl',
        metadata: { withdrawalId, userId },
      },
      // Header "Stripe-Account" direciona para a conta Connect do Maker
      { stripeAccount: stripeConnectId },
    )

    stripePayoutId = payout.id

    console.log(
      `[FinancialEngine] Stripe Payout iniciado — withdrawalId: ${withdrawalId}` +
      ` | payoutId: ${stripePayoutId}` +
      ` | R$ ${(amountCents / 100).toFixed(2)}`,
    )
  } catch (stripeErr) {
    // Payout falhou DEPOIS do débito → estorna o saldo e marca como FAILED
    await supabase.rpc('increment_wallet_balance', { p_user_id: userId, p_amount: amountCents })

    await supabase.from('wallet_transactions').insert({
      user_id:      userId,
      amount:       amountCents,
      type:         'Withdrawal_Reversal',
      reference_id: `reversal_${withdrawalId}`,
      metadata:     { reason: 'stripe_payout_failed' },
    })

    await supabase
      .from('withdrawal_requests')
      .update({
        status:         'FAILED',
        failure_reason: stripeErr instanceof Error ? stripeErr.message : 'stripe_error',
        updated_at:     new Date().toISOString(),
      })
      .eq('id', withdrawalId)

    const err = stripeErr instanceof Error ? stripeErr : new Error('STRIPE_PAYOUT_FAILED')
    throw Object.assign(err, { code: 'STRIPE_PAYOUT_FAILED' as WithdrawalError })
  }

  // ── 5. Atualiza o withdrawal para PROCESSING com o ID do payout ───────────
  await supabase
    .from('withdrawal_requests')
    .update({
      status:            'PROCESSING',
      stripe_payout_id:  stripePayoutId,
      stripe_connect_id: stripeConnectId,
      updated_at:        new Date().toISOString(),
    })
    .eq('id', withdrawalId)

  return { withdrawalId, stripePayoutId, amountCents, status: 'PROCESSING' }
}
