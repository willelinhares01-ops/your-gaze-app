-- ════════════════════════════════════════════════════════════════════════════
-- YOUR GAZE — Seed de Desenvolvimento
-- Migration: 20260709_003_seed_dev.sql
--
-- ⚠️  NÃO rodar em produção. Apenas para ambiente de desenvolvimento/sandbox.
-- Popula o banco com os Makers e posts do mock de lib/data.ts para validar
-- as rotas dinâmicas /[handle] e o painel admin.
-- ════════════════════════════════════════════════════════════════════════════

-- UUIDs fixos para referencialidade estável entre seeds
DO $$
DECLARE
  id_hub      UUID := '00000000-0000-0000-0000-000000000001';
  id_val      UUID := '00000000-0000-0000-0000-000000000002';
  id_aurora   UUID := '00000000-0000-0000-0000-000000000003';
  id_celeste  UUID := '00000000-0000-0000-0000-000000000004';
  id_valeria  UUID := '00000000-0000-0000-0000-000000000007';
  id_marcus   UUID := '00000000-0000-0000-0000-000000000008';
  id_elena    UUID := '00000000-0000-0000-0000-000000000009';

  post_p11    UUID := 'aaaaaaaa-0000-0000-0000-000000000011';
  post_p13    UUID := 'aaaaaaaa-0000-0000-0000-000000000013';
  post_p15    UUID := 'aaaaaaaa-0000-0000-0000-000000000015';
BEGIN

  -- ── Makers Fundadores ─────────────────────────────────────────────────────

  INSERT INTO profiles (id, role, handle, display_name, avatar_url, bio, founder_number, kyc_status, kyc_id, ad_revenue_usd)
  VALUES
    (id_hub,     'MAKER', '@YourGazeHub',   'Your Gaze Hub',       '/avatar-official.png',  'Conta Oficial & Sandbox de Testes do Ecossistema Your Gaze.', 1,  'VERIFIED', 'yoti-hub-001',    145.50),
    (id_val,     'MAKER', '@valentina',     'Valentina',           '/avatar-maker-1.png',   NULL,                                                          2,  'VERIFIED', 'yoti-val-002',    0.00),
    (id_aurora,  'MAKER', '@aurora',        'Aurora',              '/avatar-maker-2.png',   NULL,                                                          3,  'VERIFIED', 'yoti-aurora-003', 0.00),
    (id_celeste, 'MAKER', '@celeste',       'Celeste',             '/avatar-maker-3.png',   NULL,                                                          4,  'VERIFIED', 'yoti-cel-004',    0.00),
    (id_valeria, 'MAKER', '@ValeriaArt',    'Valéria Art',         '/avatar-valeria.png',   'Artista visual e leiloeira de obras exclusivas.',             5,  'VERIFIED', 'yoti-val-005',    0.00),
    (id_marcus,  'MAKER', '@CoachMarcus',   'Marcus Performance',  '/avatar-marcus.png',    'Estrategista de alta performance esportiva.',                 6,  'VERIFIED', 'yoti-marc-006',   0.00),
    (id_elena,   'MAKER', '@ElenaMusic',    'Elena Music',         '/avatar-elena.png',     'Compositora e produtora. Bastidores musicais.',               7,  'PENDING',  NULL,              0.00)
  ON CONFLICT (id) DO NOTHING;

  -- ── Posts por Maker ───────────────────────────────────────────────────────

  INSERT INTO posts (id, maker_id, type, title, caption, media_url, media_type, is_locked, price_usd, views, likes, min_tier)
  VALUES
    -- @ValeriaArt — Leilão 1/1
    (post_p11, id_valeria, 'AUCTION',   'Obra Original: "Olhar Soberano"', 'Obra em acrílico 90×120 cm — peça única certificada.', '/post-1.png', 'photo', TRUE,  0.00,  28400, 742,  'FREE'),
    -- @ValeriaArt — PPV Gold
    (uuid_generate_v4(), id_valeria, 'PPV_MEDIA', 'Bastidores do ateliê', 'Série de aquarelas nunca mostradas.', '/post-2.png', 'photo', TRUE, 25.00, 11200, 318, 'PREMIUM'),
    -- @CoachMarcus — PPV Gold
    (post_p13, id_marcus,  'PPV_MEDIA', 'Protocolo de Força Completo',    'Periodização avançada de 4 semanas.',                 '/post-3.png', 'video', TRUE,  14.90, 34700, 1104, 'GOLD'),
    -- @CoachMarcus — Enquete
    (uuid_generate_v4(), id_marcus,  'POLL',      'Enquete de pauta',              NULL,                                                  '/placeholder.svg', 'video', FALSE, 0.00,  0,     0,    'FREE'),
    -- @ElenaMusic — Mimo Coletivo
    (post_p15, id_elena,   'MIMO_GOAL', 'Faixa Inédita ao Vivo',          'A comunidade decide quando sai.',                     '/post-2.png', 'video', TRUE,  0.00,  9800,  0,    'FREE'),
    -- @ElenaMusic — Vídeo Gold
    (uuid_generate_v4(), id_elena,   'PPV_MEDIA', 'Session de Composição',         'Como nasceu o single do underground.',                '/post-3.png', 'video', TRUE,  19.90, 19300, 556,  'GOLD')
  ON CONFLICT (id) DO NOTHING;

  -- ── Leilão para p11 ───────────────────────────────────────────────────────

  INSERT INTO auctions (post_id, is_exclusive_1_1, starting_bid_usd, current_bid_usd, min_increment_usd, total_bids, ends_at)
  VALUES (post_p11, TRUE, 50.00, 250.00, 25.00, 14, NOW() + INTERVAL '5 hours 10 minutes')
  ON CONFLICT (post_id) DO NOTHING;

  -- ── Meta de Mimos para p15 ────────────────────────────────────────────────

  INSERT INTO mimo_goals (post_id, target_usd, current_usd, is_reached)
  VALUES (post_p15, 300.00, 187.00, FALSE)
  ON CONFLICT (post_id) DO NOTHING;

END $$;
