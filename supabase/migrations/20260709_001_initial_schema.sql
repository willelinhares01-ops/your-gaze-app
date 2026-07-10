-- ════════════════════════════════════════════════════════════════════════════
-- YOUR GAZE — Schema Inicial do Ecossistema
-- Migration: 20260709_001_initial_schema.sql
--
-- Arquitetura:
--   • profiles        → Atores (Maker, Espectador, Admin) com KYC e MGM
--   • posts           → Conteúdos (PPV, Leilão, Enquete, Meta de Mimos)
--   • auctions        → Motor de lances competitivos (1/1 e Lote)
--   • mimo_goals      → Crowdfunding coletivo de Mimos em lives
--   • subscriptions   → Assinaturas recorrentes por tier (Espectador Fiel)
--   • transactions    → Ledger financeiro com split 85/15 e trava anti-chargeback
-- ════════════════════════════════════════════════════════════════════════════

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- busca fuzzy por handle/nome

-- ─── ENUMs ────────────────────────────────────────────────────────────────────

CREATE TYPE user_role         AS ENUM ('MAKER', 'VIEWER', 'ADMIN');
CREATE TYPE kyc_status        AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE post_type         AS ENUM ('PPV_MEDIA', 'AUCTION', 'POLL', 'MIMO_GOAL');
CREATE TYPE transaction_type  AS ENUM (
  'PPV_UNLOCK',
  'MIMO_SENT',
  'SUBSCRIPTION',
  'AD_REVENUE',
  'MGM_BONUS'
);
CREATE TYPE subscription_tier AS ENUM ('FREE', 'PREMIUM', 'GOLD', 'DIAMOND');
CREATE TYPE auction_status    AS ENUM ('ACTIVE', 'ENDED', 'CANCELLED');

-- ─── Função de Timestamp Automático ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── 1. PROFILES — Atores do Ecossistema ─────────────────────────────────────
-- Referencia auth.users do Supabase Auth como identidade primária.
-- Um perfil pode ser Maker, Espectador ou Admin (role único por conta).

CREATE TABLE profiles (
  id              UUID         REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role            user_role    NOT NULL DEFAULT 'VIEWER',
  handle          VARCHAR(64)  UNIQUE NOT NULL,                    -- ex: @valentina
  display_name    VARCHAR(128) NOT NULL,
  avatar_url      TEXT,
  bio             TEXT,

  -- ── MGM (Member-Get-Member) ──────────────────────────────────────────────
  -- founder_number: atribuído sequencialmente na plataforma (1-based).
  -- #1 ao #1000 → Makers Fundadores com 2% vitalícios sobre indicados.
  founder_number  INTEGER      UNIQUE CHECK (founder_number > 0),
  referred_by     UUID         REFERENCES profiles(id) ON DELETE SET NULL,

  -- ── KYC (Yoti Biométrico) ────────────────────────────────────────────────
  kyc_status      kyc_status   NOT NULL DEFAULT 'PENDING',
  kyc_id          VARCHAR(255),                                    -- token Yoti
  kyc_verified_at TIMESTAMPTZ,                                     -- carimbo de aprovação

  -- ── Financeiro ──────────────────────────────────────────────────────────
  -- Saldo líquido disponível para saque (já descontados 15%).
  wallet_balance_usd DECIMAL(12,2) NOT NULL DEFAULT 0.00 CHECK (wallet_balance_usd >= 0),
  -- Receita de anúncios de Degustação atribuída a este Maker no mês vigente.
  ad_revenue_usd     DECIMAL(10,2) NOT NULL DEFAULT 0.00,

  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Índices de busca
CREATE INDEX idx_profiles_handle      ON profiles USING btree  (LOWER(handle));
CREATE INDEX idx_profiles_role        ON profiles USING btree  (role);
CREATE INDEX idx_profiles_kyc_status  ON profiles USING btree  (kyc_status);
CREATE INDEX idx_profiles_founder     ON profiles USING btree  (founder_number)
  WHERE founder_number IS NOT NULL;
-- Busca fuzzy por display_name (ex: campo de busca do admin)
CREATE INDEX idx_profiles_name_trgm   ON profiles USING gin   (display_name gin_trgm_ops);

-- ─── 2. POSTS — Conteúdos Monetizados ────────────────────────────────────────

CREATE TABLE posts (
  id          UUID         DEFAULT uuid_generate_v4() PRIMARY KEY,
  maker_id    UUID         REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type        post_type    NOT NULL,
  title       VARCHAR(255) NOT NULL,
  caption     TEXT,
  media_url   TEXT,
  cover_url   TEXT,                                               -- thumbnail público
  media_type  VARCHAR(8)   CHECK (media_type IN ('photo', 'video')),

  -- ── PPV ─────────────────────────────────────────────────────────────────
  is_locked   BOOLEAN      NOT NULL DEFAULT TRUE,
  price_usd   DECIMAL(10,2)         DEFAULT 0.00 CHECK (price_usd >= 0),

  -- ── Métricas públicas ────────────────────────────────────────────────────
  views       INTEGER      NOT NULL DEFAULT 0 CHECK (views >= 0),
  likes       INTEGER      NOT NULL DEFAULT 0 CHECK (likes >= 0),

  -- ── Tier mínimo para acesso ──────────────────────────────────────────────
  min_tier    subscription_tier NOT NULL DEFAULT 'FREE',

  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_posts_maker_id   ON posts (maker_id);
CREATE INDEX idx_posts_type       ON posts (type);
CREATE INDEX idx_posts_created_at ON posts (created_at DESC);

-- ─── 3. AUCTIONS — Motor de Leilões Competitivos (1/1 e Lote) ───────────────

CREATE TABLE auctions (
  id                UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id           UUID          REFERENCES posts(id) ON DELETE CASCADE UNIQUE NOT NULL,
  status            auction_status NOT NULL DEFAULT 'ACTIVE',

  is_exclusive_1_1  BOOLEAN       NOT NULL DEFAULT TRUE,          -- peça única ou lote
  lot_size          INTEGER       NOT NULL DEFAULT 1 CHECK (lot_size >= 1),

  starting_bid_usd  DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  current_bid_usd   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  min_increment_usd DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  total_bids        INTEGER       NOT NULL DEFAULT 0,

  winner_id         UUID          REFERENCES profiles(id) ON DELETE SET NULL,
  ends_at           TIMESTAMPTZ   NOT NULL,

  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_auctions_updated_at
  BEFORE UPDATE ON auctions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_auctions_status   ON auctions (status);
CREATE INDEX idx_auctions_ends_at  ON auctions (ends_at) WHERE status = 'ACTIVE';

-- ─── 4. MIMO_GOALS — Crowdfunding Coletivo de Mimos ─────────────────────────

CREATE TABLE mimo_goals (
  id            UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id       UUID          REFERENCES posts(id) ON DELETE CASCADE UNIQUE NOT NULL,
  target_usd    DECIMAL(10,2) NOT NULL CHECK (target_usd > 0),
  current_usd   DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (current_usd >= 0),
  is_reached    BOOLEAN       NOT NULL DEFAULT FALSE,
  reached_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mimo_goals_post_id ON mimo_goals (post_id);

-- ─── 5. SUBSCRIPTIONS — Assinaturas Recorrentes (Espectador Fiel) ────────────

CREATE TABLE subscriptions (
  id          UUID              DEFAULT uuid_generate_v4() PRIMARY KEY,
  viewer_id   UUID              REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  maker_id    UUID              REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tier        subscription_tier NOT NULL DEFAULT 'PREMIUM',
  price_usd   DECIMAL(10,2)     NOT NULL CHECK (price_usd >= 0),

  -- Datas de vigência
  started_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ       NOT NULL,
  cancelled_at TIMESTAMPTZ,

  -- Stripe / gateway
  stripe_subscription_id VARCHAR(255),

  -- Garantia de unicidade: um Espectador só tem uma assinatura ativa por Maker
  CONSTRAINT uq_active_subscription UNIQUE (viewer_id, maker_id)
);

CREATE INDEX idx_subs_viewer_id  ON subscriptions (viewer_id);
CREATE INDEX idx_subs_maker_id   ON subscriptions (maker_id);
CREATE INDEX idx_subs_expires_at ON subscriptions (expires_at) WHERE cancelled_at IS NULL;

-- ─── 6. TRANSACTIONS — Ledger Financeiro (Split 85/15) ───────────────────────
-- Registro imutável de toda movimentação financeira do ecossistema.
-- maker_net_usd e platform_fee_usd são SEMPRE computados pelo trigger abaixo —
-- nunca inseridos diretamente pelo cliente.

CREATE TABLE transactions (
  id                UUID              DEFAULT uuid_generate_v4() PRIMARY KEY,
  buyer_id          UUID              REFERENCES profiles(id) ON DELETE SET NULL,
  maker_id          UUID              REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  post_id           UUID              REFERENCES posts(id)    ON DELETE SET NULL,
  type              transaction_type  NOT NULL,

  gross_amount_usd  DECIMAL(12,2)     NOT NULL CHECK (gross_amount_usd > 0),
  maker_net_usd     DECIMAL(12,2)     NOT NULL,   -- 85%
  platform_fee_usd  DECIMAL(12,2)     NOT NULL,   -- 15%

  -- Trava anti-chargeback de 15 dias (obrigatória antes de liberar saque)
  -- PENDING_CLEARANCE → CLEARED → (saque permitido) | DISPUTED → REFUNDED
  status            VARCHAR(32)       NOT NULL DEFAULT 'PENDING_CLEARANCE'
                    CHECK (status IN (
                      'PENDING_CLEARANCE',
                      'CLEARED',
                      'DISPUTED',
                      'REFUNDED'
                    )),
  clears_at         TIMESTAMPTZ       GENERATED ALWAYS AS
                      (created_at + INTERVAL '15 days') STORED,

  -- Rastreio de gateway externo
  stripe_payment_intent_id VARCHAR(255),

  created_at        TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

-- Trigger: garante que os campos de split são sempre computados no servidor
CREATE OR REPLACE FUNCTION compute_transaction_split()
RETURNS TRIGGER AS $$
BEGIN
  NEW.maker_net_usd    := ROUND(NEW.gross_amount_usd * 0.85, 2);
  NEW.platform_fee_usd := ROUND(NEW.gross_amount_usd * 0.15, 2);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_transactions_split
  BEFORE INSERT OR UPDATE OF gross_amount_usd ON transactions
  FOR EACH ROW EXECUTE FUNCTION compute_transaction_split();

-- Trigger: ao CLEARED, credita saldo na carteira do Maker
CREATE OR REPLACE FUNCTION credit_maker_wallet()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'CLEARED' AND OLD.status <> 'CLEARED' THEN
    UPDATE profiles
    SET wallet_balance_usd = wallet_balance_usd + NEW.maker_net_usd
    WHERE id = NEW.maker_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_credit_wallet
  AFTER UPDATE OF status ON transactions
  FOR EACH ROW EXECUTE FUNCTION credit_maker_wallet();

CREATE INDEX idx_transactions_maker_id  ON transactions (maker_id, created_at DESC);
CREATE INDEX idx_transactions_buyer_id  ON transactions (buyer_id);
CREATE INDEX idx_transactions_status    ON transactions (status);
CREATE INDEX idx_transactions_clears_at ON transactions (clears_at) WHERE status = 'PENDING_CLEARANCE';
