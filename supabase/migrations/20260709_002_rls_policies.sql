-- ════════════════════════════════════════════════════════════════════════════
-- YOUR GAZE — Row Level Security (RLS)
-- Migration: 20260709_002_rls_policies.sql
--
-- Filosofia: negação por padrão. Cada política libera o mínimo necessário.
-- A chave `service_role` do Supabase (usada apenas no backend/Edge Functions)
-- ignora RLS — nunca expô-la ao cliente.
-- ════════════════════════════════════════════════════════════════════════════

-- ── Ativa RLS em todas as tabelas ────────────────────────────────────────────

ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE mimo_goals    ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions  ENABLE ROW LEVEL SECURITY;

-- ── Helper: verifica se o caller é Admin ──────────────────────────────────────

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Helper: verifica se o caller tem KYC VERIFIED ────────────────────────────

CREATE OR REPLACE FUNCTION is_kyc_verified()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND kyc_status = 'VERIFIED'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ═══════════════════════════
-- PROFILES
-- ═══════════════════════════

-- Qualquer usuário autenticado lê perfis públicos
CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT
  USING (TRUE);

-- Cada usuário edita apenas o próprio perfil
CREATE POLICY "profiles_update_self"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Inserção controlada pelo trigger de signup (service_role apenas)
CREATE POLICY "profiles_insert_service"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admin pode tudo
CREATE POLICY "profiles_admin_all"
  ON profiles FOR ALL
  USING (is_admin());

-- ═══════════════════════════
-- POSTS
-- ═══════════════════════════

-- Leitura pública de posts desbloqueados (vitrine de degustação)
CREATE POLICY "posts_select_public"
  ON posts FOR SELECT
  USING (is_locked = FALSE OR maker_id = auth.uid() OR is_admin());

-- Maker só cria/edita/deleta os próprios posts (KYC obrigatório)
CREATE POLICY "posts_maker_write"
  ON posts FOR INSERT
  WITH CHECK (maker_id = auth.uid() AND is_kyc_verified());

CREATE POLICY "posts_maker_update"
  ON posts FOR UPDATE
  USING (maker_id = auth.uid());

CREATE POLICY "posts_maker_delete"
  ON posts FOR DELETE
  USING (maker_id = auth.uid());

-- ═══════════════════════════
-- AUCTIONS
-- ═══════════════════════════

-- Leilões ativos são públicos
CREATE POLICY "auctions_select_active"
  ON auctions FOR SELECT
  USING (status = 'ACTIVE' OR is_admin());

-- Somente o Maker dono do post pode criar/editar leilão
CREATE POLICY "auctions_maker_write"
  ON auctions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_id AND posts.maker_id = auth.uid()
    )
    AND is_kyc_verified()
  );

-- ═══════════════════════════
-- MIMO_GOALS
-- ═══════════════════════════

CREATE POLICY "mimo_goals_select_public"
  ON mimo_goals FOR SELECT
  USING (TRUE);

CREATE POLICY "mimo_goals_maker_write"
  ON mimo_goals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_id AND posts.maker_id = auth.uid()
    )
  );

-- ═══════════════════════════
-- SUBSCRIPTIONS
-- ═══════════════════════════

-- Espectador vê apenas as próprias assinaturas; Maker vê os seus assinantes
CREATE POLICY "subscriptions_select_own"
  ON subscriptions FOR SELECT
  USING (viewer_id = auth.uid() OR maker_id = auth.uid() OR is_admin());

-- Espectador cria a própria assinatura (via Edge Function / webhook Stripe)
CREATE POLICY "subscriptions_viewer_insert"
  ON subscriptions FOR INSERT
  WITH CHECK (viewer_id = auth.uid());

-- Cancelamento: somente o próprio Espectador ou Admin
CREATE POLICY "subscriptions_viewer_cancel"
  ON subscriptions FOR UPDATE
  USING (viewer_id = auth.uid() OR is_admin());

-- ═══════════════════════════
-- TRANSACTIONS
-- ═══════════════════════════

-- Espectador vê os próprios pagamentos; Maker vê os próprios recebimentos
CREATE POLICY "transactions_select_own"
  ON transactions FOR SELECT
  USING (buyer_id = auth.uid() OR maker_id = auth.uid() OR is_admin());

-- Inserção exclusiva via service_role (Edge Function de pagamento)
-- Nenhum cliente pode inserir transações diretamente
CREATE POLICY "transactions_no_direct_insert"
  ON transactions FOR INSERT
  WITH CHECK (FALSE);   -- bloqueia clientes; service_role ignora RLS

-- Admin pode ver e atualizar status (disputas)
CREATE POLICY "transactions_admin_all"
  ON transactions FOR ALL
  USING (is_admin());
