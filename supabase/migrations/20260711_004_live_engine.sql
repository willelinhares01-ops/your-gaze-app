-- ════════════════════════════════════════════════════════════════════════════
-- YOUR GAZE — Motor de Transmissões ao Vivo & Gamificação
-- Migration: 20260711_004_live_engine.sql
--
-- Incrementa o schema existente (migration 001) sem recriar ENUMs ou tabelas
-- já presentes. Aplica somente após 20260709_001_initial_schema.sql.
--
-- Novas entidades:
--   • ENUM live_type              → INDIVIDUAL | COLLECTIVE
--   • ENUM transaction_type       → +LIVE_TICKET, +GAME_BID (ALTER ADD VALUE)
--   • scheduled_lives             → Motor de transmissões agendadas com ticket
--   • live_games                  → Opções de gamificação/bidding war por rodada
--   • live_participants           → Registro de ingressos vendidos por live
--   • RLS para as novas tabelas
-- ════════════════════════════════════════════════════════════════════════════

-- ─── 1. Novos ENUMs ───────────────────────────────────────────────────────────

CREATE TYPE live_type   AS ENUM ('INDIVIDUAL', 'COLLECTIVE');
CREATE TYPE live_status AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED');

-- Estende o ENUM existente com os novos tipos de transação.
-- ALTER TYPE ADD VALUE é auto-comitado fora de bloco de transação no Postgres
-- — roda antes dos CREATE TABLE para garantir disponibilidade imediata.
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'LIVE_TICKET';
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'GAME_BID';

-- ─── 2. SCHEDULED_LIVES — Motor de Transmissões Agendadas ────────────────────
--
-- Suporta dois modelos de negócio:
--   INDIVIDUAL  → uma Maker com ingresso fixo (ticket_price_usd)
--   COLLECTIVE  → múltiplas Makers, ingresso compartilhado, receita splitada

CREATE TABLE scheduled_lives (
  id                   UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
  maker_id             UUID          REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type                 live_type     NOT NULL,
  status               live_status   NOT NULL DEFAULT 'SCHEDULED',
  title                VARCHAR(255)  NOT NULL,

  -- ── Agendamento ────────────────────────────────────────────────────────
  scheduled_start_at   TIMESTAMPTZ   NOT NULL,
  started_at           TIMESTAMPTZ,    -- preenchido ao mudar status → LIVE
  ended_at             TIMESTAMPTZ,    -- preenchido ao mudar status → COMPLETED

  -- ── Modelo financeiro ──────────────────────────────────────────────────
  -- ticket_price_usd = 0 → live gratuita (apenas Mimos/Bids monetizam)
  ticket_price_usd     DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (ticket_price_usd >= 0),
  min_participants     INTEGER       NOT NULL DEFAULT 1   CHECK (min_participants >= 1),

  -- ── Gamificação ────────────────────────────────────────────────────────
  -- Número total de rodadas de votação/bidding a serem jogadas nesta live.
  game_rounds          INTEGER       NOT NULL DEFAULT 1   CHECK (game_rounds >= 1),
  current_round        INTEGER       NOT NULL DEFAULT 0   CHECK (current_round >= 0),

  -- ── URL de streaming (gerada pelo servidor antes do start) ─────────────
  stream_url           TEXT,

  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_scheduled_lives_updated_at
  BEFORE UPDATE ON scheduled_lives
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_lives_maker_id           ON scheduled_lives (maker_id);
CREATE INDEX idx_lives_status             ON scheduled_lives (status);
CREATE INDEX idx_lives_scheduled_start_at ON scheduled_lives (scheduled_start_at DESC);
-- Índice parcial: lives futuras agendadas (lookup mais frequente na vitrine)
CREATE INDEX idx_lives_upcoming           ON scheduled_lives (scheduled_start_at)
  WHERE status = 'SCHEDULED';

-- ─── 3. LIVE_GAMES — Rodadas de Gamificação (Bidding War) ────────────────────
--
-- Cada rodada de uma live apresenta N opções (ex: temas, figurinos, interações).
-- Os Espectadores enviam mimos cumulativos para a opção desejada.
-- A opção que atingir `min_bid_goal_usd` primeiro (ou com maior valor ao fim
-- da rodada) é declarada vencedora.

CREATE TABLE live_games (
  id                 UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
  live_id            UUID          REFERENCES scheduled_lives(id) ON DELETE CASCADE NOT NULL,
  round_number       INTEGER       NOT NULL CHECK (round_number >= 1),
  option_name        VARCHAR(255)  NOT NULL,        -- ex: 'Tema Praia', 'Roupa Preta'
  description        TEXT,                          -- contexto opcional para o Espectador
  min_bid_goal_usd   DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (min_bid_goal_usd >= 0),
  current_bids_usd   DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (current_bids_usd >= 0),
  is_winner          BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Garante que nomes de opção sejam únicos dentro da mesma rodada
  CONSTRAINT uq_live_game_option UNIQUE (live_id, round_number, option_name)
);

CREATE TRIGGER trg_live_games_updated_at
  BEFORE UPDATE ON live_games
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_live_games_live_id ON live_games (live_id, round_number);

-- ─── 4. LIVE_PARTICIPANTS — Ingressos Vendidos por Transmissão ───────────────
--
-- Registra quem comprou acesso a uma live específica.
-- Consultado em tempo real para controle de sala e exibição de "N ao vivo".

CREATE TABLE live_participants (
  id            UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  live_id       UUID        REFERENCES scheduled_lives(id) ON DELETE CASCADE NOT NULL,
  viewer_id     UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  transaction_id UUID       REFERENCES transactions(id) ON DELETE SET NULL,
  joined_at     TIMESTAMPTZ,   -- NULL até entrar na sala (comprou mas não entrou ainda)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_live_participant UNIQUE (live_id, viewer_id)
);

CREATE INDEX idx_live_participants_live_id   ON live_participants (live_id);
CREATE INDEX idx_live_participants_viewer_id ON live_participants (viewer_id);

-- ─── 5. RLS — Row Level Security para as novas tabelas ───────────────────────

ALTER TABLE scheduled_lives    ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_games         ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_participants  ENABLE ROW LEVEL SECURITY;

-- SCHEDULED_LIVES: leitura pública; escrita só pelo Maker dono (com KYC)
CREATE POLICY "lives_select_public"
  ON scheduled_lives FOR SELECT
  USING (TRUE);

CREATE POLICY "lives_maker_insert"
  ON scheduled_lives FOR INSERT
  WITH CHECK (maker_id = auth.uid() AND is_kyc_verified());

CREATE POLICY "lives_maker_update"
  ON scheduled_lives FOR UPDATE
  USING (maker_id = auth.uid());

CREATE POLICY "lives_admin_all"
  ON scheduled_lives FOR ALL
  USING (is_admin());

-- LIVE_GAMES: leitura pública; escrita só pelo Maker dono da live
CREATE POLICY "live_games_select_public"
  ON live_games FOR SELECT
  USING (TRUE);

CREATE POLICY "live_games_maker_write"
  ON live_games FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM scheduled_lives
      WHERE scheduled_lives.id = live_id
        AND scheduled_lives.maker_id = auth.uid()
    )
  );

CREATE POLICY "live_games_maker_update"
  ON live_games FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM scheduled_lives
      WHERE scheduled_lives.id = live_id
        AND scheduled_lives.maker_id = auth.uid()
    )
  );

-- LIVE_PARTICIPANTS: Espectador vê os próprios ingressos; Maker vê a lista da sua live
CREATE POLICY "live_participants_select_own"
  ON live_participants FOR SELECT
  USING (
    viewer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM scheduled_lives
      WHERE scheduled_lives.id = live_id
        AND scheduled_lives.maker_id = auth.uid()
    )
    OR is_admin()
  );

-- Inserção controlada pelo webhook de pagamento (service_role)
CREATE POLICY "live_participants_no_direct_insert"
  ON live_participants FOR INSERT
  WITH CHECK (FALSE);

-- ─── 6. Trigger: atualiza current_bids_usd ao registrar GAME_BID ─────────────
--
-- Quando uma transação do tipo GAME_BID é inserida, incrementa automaticamente
-- o `current_bids_usd` da opção correspondente em live_games.
-- `reference_id` na transactions aponta para live_games.id neste contexto.

CREATE OR REPLACE FUNCTION update_live_game_bids()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'GAME_BID' AND NEW.reference_id IS NOT NULL THEN
    UPDATE live_games
    SET current_bids_usd = current_bids_usd + NEW.maker_net_usd
    WHERE id = NEW.reference_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_game_bids
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_live_game_bids();

-- ─── 7. Trigger: atualiza status da live automaticamente ─────────────────────

CREATE OR REPLACE FUNCTION auto_update_live_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Marca started_at ao entrar ao vivo
  IF NEW.status = 'LIVE' AND OLD.status <> 'LIVE' THEN
    NEW.started_at := NOW();
  END IF;
  -- Marca ended_at ao concluir
  IF NEW.status = 'COMPLETED' AND OLD.status <> 'COMPLETED' THEN
    NEW.ended_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_live_status
  BEFORE UPDATE OF status ON scheduled_lives
  FOR EACH ROW EXECUTE FUNCTION auto_update_live_status();
