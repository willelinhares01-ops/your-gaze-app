/**
 * YOUR GAZE — Tipos TypeScript do Schema Supabase
 *
 * Gerado manualmente a partir de:
 *   supabase/migrations/20260709_001_initial_schema.sql
 *   supabase/migrations/20260711_004_live_engine.sql
 *
 * Em produção, gerar automaticamente via:
 *   supabase gen types typescript --local > lib/database.types.ts
 */

// ─── ENUMs ────────────────────────────────────────────────────────────────────

export type UserRole         = 'MAKER' | 'VIEWER' | 'ADMIN'
export type KycStatus        = 'PENDING' | 'VERIFIED' | 'REJECTED'
export type PostType         = 'PPV_MEDIA' | 'AUCTION' | 'POLL' | 'MIMO_GOAL'
export type TransactionType  = 'PPV_UNLOCK' | 'MIMO_SENT' | 'SUBSCRIPTION' | 'AD_REVENUE' | 'MGM_BONUS' | 'LIVE_TICKET' | 'GAME_BID'
export type SubscriptionTier = 'FREE' | 'PREMIUM' | 'GOLD' | 'DIAMOND'
export type AuctionStatus    = 'ACTIVE' | 'ENDED' | 'CANCELLED'
export type TransactionStatus = 'PENDING_CLEARANCE' | 'CLEARED' | 'DISPUTED' | 'REFUNDED'
export type LiveType         = 'INDIVIDUAL' | 'COLLECTIVE'
export type LiveStatus       = 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED'

// ─── Linhas de Tabela (Row types) ─────────────────────────────────────────────

export interface ProfileRow {
  id:                   string           // UUID
  role:                 UserRole
  handle:               string
  display_name:         string
  avatar_url:           string | null
  bio:                  string | null
  founder_number:       number | null    // #1–#1000 → Maker Fundador
  referred_by:          string | null    // UUID → profiles.id (indicador MGM)
  kyc_status:           KycStatus
  kyc_id:               string | null
  kyc_verified_at:      string | null    // ISO 8601
  wallet_balance_usd:   number
  ad_revenue_usd:       number
  created_at:           string           // ISO 8601
  updated_at:           string           // ISO 8601
}

export interface PostRow {
  id:          string
  maker_id:    string
  type:        PostType
  title:       string
  caption:     string | null
  media_url:   string | null
  cover_url:   string | null
  media_type:  'photo' | 'video' | null
  is_locked:   boolean
  price_usd:   number
  views:       number
  likes:       number
  min_tier:    SubscriptionTier
  created_at:  string
  updated_at:  string
}

export interface AuctionRow {
  id:                 string
  post_id:            string
  status:             AuctionStatus
  is_exclusive_1_1:   boolean
  lot_size:           number
  starting_bid_usd:   number
  current_bid_usd:    number
  min_increment_usd:  number
  total_bids:         number
  winner_id:          string | null
  ends_at:            string           // ISO 8601
  created_at:         string
  updated_at:         string
}

export interface MimoGoalRow {
  id:           string
  post_id:      string
  target_usd:   number
  current_usd:  number
  is_reached:   boolean
  reached_at:   string | null
  created_at:   string
}

export interface SubscriptionRow {
  id:                     string
  viewer_id:              string
  maker_id:               string
  tier:                   SubscriptionTier
  price_usd:              number
  started_at:             string
  expires_at:             string
  cancelled_at:           string | null
  stripe_subscription_id: string | null
}

export interface TransactionRow {
  id:                       string
  buyer_id:                 string | null
  maker_id:                 string
  post_id:                  string | null
  type:                     TransactionType
  gross_amount_usd:         number
  maker_net_usd:            number           // sempre 85% — computado por trigger
  platform_fee_usd:         number           // sempre 15% — computado por trigger
  status:                   TransactionStatus
  clears_at:                string           // ISO 8601 — gerado (created_at + 15 days)
  stripe_payment_intent_id: string | null
  created_at:               string
}

// ─── Payloads de Insert (omite campos gerados automaticamente) ─────────────────

export type ProfileInsert = Omit<ProfileRow,
  | 'wallet_balance_usd'
  | 'ad_revenue_usd'
  | 'created_at'
  | 'updated_at'
> & Partial<Pick<ProfileRow, 'wallet_balance_usd' | 'ad_revenue_usd'>>

export type PostInsert = Omit<PostRow, 'id' | 'views' | 'likes' | 'created_at' | 'updated_at'>
  & Partial<Pick<PostRow, 'id' | 'views' | 'likes'>>

export type AuctionInsert = Omit<AuctionRow,
  | 'id'
  | 'status'
  | 'current_bid_usd'
  | 'total_bids'
  | 'winner_id'
  | 'created_at'
  | 'updated_at'
> & Partial<Pick<AuctionRow, 'status' | 'current_bid_usd' | 'total_bids' | 'winner_id'>>

export type MimoGoalInsert = Omit<MimoGoalRow, 'id' | 'is_reached' | 'reached_at' | 'created_at'>
  & Partial<Pick<MimoGoalRow, 'is_reached' | 'reached_at'>>

export type SubscriptionInsert = Omit<SubscriptionRow, 'id' | 'started_at'>
  & Partial<Pick<SubscriptionRow, 'started_at'>>

/**
 * TransactionInsert omite os campos calculados pelo trigger (maker_net_usd,
 * platform_fee_usd, clears_at) — nunca enviados pelo cliente.
 * Inserções só são aceitas pela service_role (Edge Function).
 */
export type TransactionInsert = Omit<TransactionRow,
  | 'id'
  | 'maker_net_usd'
  | 'platform_fee_usd'
  | 'clears_at'
  | 'created_at'
>

// ─── Live Engine — Transmissões Agendadas ─────────────────────────────────────

export interface ScheduledLiveRow {
  id:                  string
  maker_id:            string
  type:                LiveType
  status:              LiveStatus
  title:               string
  scheduled_start_at:  string           // ISO 8601
  started_at:          string | null    // preenchido ao status → LIVE
  ended_at:            string | null    // preenchido ao status → COMPLETED
  ticket_price_usd:    number           // 0 = gratuita
  min_participants:    number
  game_rounds:         number
  current_round:       number
  stream_url:          string | null
  created_at:          string
  updated_at:          string
}

export type ScheduledLiveInsert = Omit<ScheduledLiveRow,
  | 'id'
  | 'status'
  | 'started_at'
  | 'ended_at'
  | 'current_round'
  | 'stream_url'
  | 'created_at'
  | 'updated_at'
> & Partial<Pick<ScheduledLiveRow, 'status' | 'current_round' | 'stream_url'>>

// ─── Live Engine — Rodadas de Gamificação (Bidding War) ───────────────────────

export interface LiveGameRow {
  id:                string
  live_id:           string
  round_number:      number
  option_name:       string
  description:       string | null
  min_bid_goal_usd:  number
  current_bids_usd:  number
  is_winner:         boolean
  created_at:        string
  updated_at:        string
}

export type LiveGameInsert = Omit<LiveGameRow,
  | 'id'
  | 'current_bids_usd'
  | 'is_winner'
  | 'created_at'
  | 'updated_at'
> & Partial<Pick<LiveGameRow, 'current_bids_usd' | 'is_winner' | 'description'>>

// ─── Live Engine — Participantes / Ingressos ──────────────────────────────────

export interface LiveParticipantRow {
  id:             string
  live_id:        string
  viewer_id:      string
  transaction_id: string | null
  joined_at:      string | null    // NULL até entrar na sala
  created_at:     string
}

export type LiveParticipantInsert = Omit<LiveParticipantRow, 'id' | 'created_at'>
  & Partial<Pick<LiveParticipantRow, 'joined_at'>>

// ─── Database schema (compatível com createClient<Database>()) ─────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row:    ProfileRow
        Insert: ProfileInsert
        Update: Partial<ProfileInsert>
      }
      posts: {
        Row:    PostRow
        Insert: PostInsert
        Update: Partial<PostInsert>
      }
      auctions: {
        Row:    AuctionRow
        Insert: AuctionInsert
        Update: Partial<AuctionInsert>
      }
      mimo_goals: {
        Row:    MimoGoalRow
        Insert: MimoGoalInsert
        Update: Partial<MimoGoalInsert>
      }
      subscriptions: {
        Row:    SubscriptionRow
        Insert: SubscriptionInsert
        Update: Partial<SubscriptionInsert>
      }
      transactions: {
        Row:    TransactionRow
        Insert: TransactionInsert
        Update: never   // transações são imutáveis (apenas status é alterável via RPC)
      }
      scheduled_lives: {
        Row:    ScheduledLiveRow
        Insert: ScheduledLiveInsert
        Update: Partial<ScheduledLiveInsert>
      }
      live_games: {
        Row:    LiveGameRow
        Insert: LiveGameInsert
        Update: Partial<LiveGameInsert>
      }
      live_participants: {
        Row:    LiveParticipantRow
        Insert: LiveParticipantInsert
        Update: Partial<LiveParticipantInsert>
      }
    }
    Views:     Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role:         UserRole
      kyc_status:        KycStatus
      post_type:         PostType
      transaction_type:  TransactionType
      subscription_tier: SubscriptionTier
      auction_status:    AuctionStatus
      live_type:         LiveType
      live_status:       LiveStatus
    }
  }
}
