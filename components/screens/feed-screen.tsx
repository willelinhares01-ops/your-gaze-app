'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import {
  Heart,
  MessageCircle,
  Bookmark,
  Lock,
  Crown,
  Gem,
  ChevronLeft,
  ChevronRight,
  Eye,
  TrendingUp,
  LayoutGrid,
  ImageIcon,
  Play,
  Search,
  X,
  BarChart2,
  CheckCircle2,
  Clock,
  Gavel,
  Flame,
  ShieldCheck,
} from 'lucide-react'
import { useApp } from '@/components/app-context'
import { LilioRosaIcon } from '@/components/ui/lirio-rosa-icon'
import { makers, posts as allPosts, currentMaker, type Post } from '@/lib/data'
import { MimoProgressBar } from '@/components/screens/maker/upload-screen'
import { useDict } from '@/lib/locale-context'
import { cn } from '@/lib/utils'

// ─── Tabs ─────────────────────────────────────────────────────────────────────
// Três canais de distribuição do algoritmo do feed
const TAB_KEYS = ['alta', 'recente', 'novatos'] as const
type Tab = (typeof TAB_KEYS)[number]

// Uma postagem é "exclusiva" (bloqueada) quando é Gold ou Diamond.
// A degustação pública usa o tier 'Premium' simples.
function isExclusive(post: Post) {
  return post.tier === 'Premium Gold' || post.tier === 'Premium Diamond'
}

function tempoRelativo(mins: number) {
  if (mins < 60) return `há ${mins} min`
  const h = Math.floor(mins / 60)
  if (h < 24) return `há ${h} h`
  return `há ${Math.floor(h / 24)} d`
}

// ─── Carrossel de Makers em Destaque ─────────────────────────────────────────
function MakersCarousel() {
  const t = useDict()
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'right' ? 220 : -220, behavior: 'smooth' })
  }

  type FeaturedTier = 'Diamond' | 'Gold' | 'Premium'
  type FeaturedMaker = (typeof makers)[number] & { subscribers: string; tier: FeaturedTier }

  const featured: FeaturedMaker[] = [
    { ...makers[0], subscribers: '12,4 mil', tier: 'Diamond' },
    { ...makers[1], subscribers: '8,9 mil',  tier: 'Gold'    },
    { ...makers[2], subscribers: '5,2 mil',  tier: 'Premium' },
    { ...makers[3], subscribers: '17,1 mil', tier: 'Diamond' },
    { ...makers[4], subscribers: '3,6 mil',  tier: 'Gold'    },
  ]

  const tierColor: Record<FeaturedTier, string> = {
    Diamond: 'from-[#b9f2ff] via-gold to-[#c084fc]',
    Gold:    'from-gold via-[#f5d87e] to-gold',
    Premium: 'from-navy via-navy/60 to-gold',
  }

  return (
    <section className="relative border-b border-border bg-background py-6">
      {/* Setas de navegação */}
      <button
        type="button"
        onClick={() => scroll('left')}
        aria-label={t.viewer_feed.prev}
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 flex size-8 items-center justify-center rounded-full border border-border bg-background/90 text-navy shadow-sm transition hover:bg-secondary"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => scroll('right')}
        aria-label={t.viewer_feed.next}
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex size-8 items-center justify-center rounded-full border border-border bg-background/90 text-navy shadow-sm transition hover:bg-secondary"
      >
        <ChevronRight className="size-4" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto px-10 scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
      >
        {featured.map((maker) => (
          <div key={maker.id} className="flex w-44 shrink-0 flex-col items-center gap-3">
            {/* Avatar com anel dourado/tier */}
            <div className={cn('rounded-full bg-gradient-to-tr p-[2.5px]', tierColor[maker.tier])}>
              <div className="relative size-24 overflow-hidden rounded-full border-2 border-background">
                <Image
                  src={maker.avatar || '/placeholder.svg'}
                  alt={maker.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Infos */}
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-sm font-semibold text-navy leading-tight">{maker.name}</p>
              <p className="text-xs text-muted-foreground">{maker.handle}</p>
              <span
                className={cn(
                  'mt-0.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  maker.tier === 'Diamond'
                    ? 'bg-[#c084fc]/15 text-[#7c3aed]'
                    : maker.tier === 'Gold'
                      ? 'bg-gold/15 text-[#92620a]'
                      : 'bg-navy/10 text-navy',
                )}
              >
                {maker.tier === 'Diamond' ? (
                  <Gem className="size-2.5" />
                ) : (
                  <Crown className="size-2.5" />
                )}
                {maker.tier} · {maker.subscribers}
              </span>
            </div>

            {/* Botão de assinatura */}
            <button
              type="button"
              className="w-full rounded-lg border border-gold bg-gold/10 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-gold hover:text-navy"
            >
              {t.viewer_feed.assinar}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Overlay Leilão de Mimos — Crowdfunding de VOD ────────────────────────────
function MimoOverlay({
  meta,
}: {
  meta: NonNullable<Post['mimoMeta']>
}) {
  const t = useDict()
  const pct = Math.min((meta.arrecadado / meta.alvo) * 100, 100)
  const fmt = (v: number) =>
    v.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-end gap-0 bg-gradient-to-t from-navy/80 via-navy/40 to-transparent px-5 pb-5">
      {/* Título da meta */}
      <div className="mb-3 flex items-center gap-2">
        <LilioRosaIcon size={16} />
        <span className="text-xs font-bold uppercase tracking-widest text-gold">
          {t.viewer_feed.mimo_meta}
        </span>
      </div>

      {/* Valores */}
      <div className="mb-2 flex w-full items-baseline justify-between">
        <span className="text-lg font-bold text-gold">{fmt(meta.arrecadado)}</span>
        <span className="text-xs text-white/70">
          {t.viewer_feed.mimo_de} {fmt(meta.alvo)}
        </span>
      </div>

      {/* Barra de progresso dourada */}
      <div className="mb-1 h-2.5 w-full overflow-hidden rounded-full bg-white/20 backdrop-blur-sm">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold/80 to-gold shadow-[0_0_6px_rgba(212,175,55,0.8)] transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mb-4 w-full text-right text-[11px] text-white/60">
        {pct.toFixed(0)}% {t.viewer_feed.mimo_progresso}
      </p>

      {/* CTA */}
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gold bg-gold px-5 py-2.5 text-sm font-bold tracking-wide text-navy shadow-md transition-opacity hover:opacity-90 active:scale-95"
      >
        <LilioRosaIcon size={16} />
        {t.viewer_feed.mimo_cta}
      </button>
    </div>
  )
}

// ─── CTA de desbloqueio (gatilho Fiel Espectador) ────────────────────────────
function FielCTA({ onBecomeFiel }: { onBecomeFiel: () => void }) {
  const t = useDict()
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-4">
      {/* Cadeado dourado */}
      <div className="flex size-14 items-center justify-center rounded-full border-2 border-gold bg-background/80 shadow-lg backdrop-blur-sm">
        <Lock className="size-7 text-gold" strokeWidth={1.75} />
      </div>

      {/* Texto VIP */}
      <div className="text-center">
        <p className="text-sm font-semibold text-navy drop-shadow-sm">
          {t.viewer_feed.conteudo_exclusivo}
        </p>
        <p className="mt-0.5 text-xs text-navy/70 drop-shadow-sm">
          {t.viewer_feed.disponivel_fieis}
        </p>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onBecomeFiel}
        className="rounded-xl border-2 border-gold bg-gold px-5 py-2.5 text-xs font-bold tracking-wide text-navy shadow-md transition-opacity hover:opacity-90 active:scale-95"
      >
        {t.viewer_feed.cta_fiel}
      </button>
    </div>
  )
}

// ─── Enquete interativa (Estúdio de Votações) ─────────────────────────────────
function PollBody({
  enquete,
}: {
  enquete: NonNullable<Post['enquete']>
}) {
  const t = useDict()
  const [votedId, setVotedId] = useState<string | null>(null)

  const totalBase = enquete.opcoes.reduce((s, o) => s + o.votos, 0)
  const total = votedId !== null ? totalBase + 1 : totalBase

  const duracaoLabel: Record<'24h' | '3d' | '7d', string> = {
    '24h': '24h restantes',
    '3d':  '3 dias restantes',
    '7d':  '7 dias restantes',
  }

  return (
    <div className="border-t border-border bg-card px-5 py-5">
      {/* Header da enquete */}
      <div className="mb-4 flex items-center gap-2">
        <BarChart2 className="size-4 text-[#7c3aed]" />
        <span className="text-xs font-bold uppercase tracking-widest text-[#7c3aed]">
          {t.viewer_feed.enquete_label}
        </span>
        {!enquete.encerrada && (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-[#c084fc]/10 px-2 py-0.5 text-[10px] font-medium text-[#7c3aed]">
            <Clock className="size-3" />
            {duracaoLabel[enquete.duracao]}
          </span>
        )}
      </div>

      {/* Pergunta */}
      <p className="mb-5 text-base font-bold leading-snug text-navy">
        {enquete.pergunta}
      </p>

      {/* Opções */}
      <div className="flex flex-col gap-2.5">
        {enquete.opcoes.map((opcao) => {
          const votosOpcao = opcao.votos + (votedId === opcao.id ? 1 : 0)
          const pct = total > 0 ? Math.round((votosOpcao / total) * 100) : 0
          const isVoted = votedId === opcao.id
          const hasVoted = votedId !== null || enquete.encerrada

          return (
            <button
              key={opcao.id}
              type="button"
              onClick={() => {
                if (!hasVoted) setVotedId(opcao.id)
              }}
              disabled={!!enquete.encerrada || hasVoted}
              className={cn(
                'relative overflow-hidden rounded-xl border text-left transition-all duration-200',
                isVoted
                  ? 'border-[#c084fc]/60 shadow-sm'
                  : hasVoted
                    ? 'border-border'
                    : 'border-border hover:border-[#c084fc]/50 hover:shadow-sm cursor-pointer',
              )}
            >
              {/* Barra de progresso (fundo suave) */}
              {hasVoted && (
                <div
                  className={cn(
                    'absolute inset-0 rounded-xl transition-all duration-700',
                    isVoted ? 'bg-[#c084fc]/20' : 'bg-gold/10',
                  )}
                  style={{ width: `${pct}%` }}
                />
              )}

              <div className="relative z-10 flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {isVoted ? (
                    <CheckCircle2 className="size-4 shrink-0 text-[#7c3aed]" />
                  ) : (
                    <span
                      className={cn(
                        'flex size-4 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold',
                        hasVoted ? 'border-border text-muted-foreground' : 'border-[#c084fc]/50 text-[#7c3aed]',
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      'truncate text-sm',
                      isVoted ? 'font-semibold text-navy' : 'font-medium text-navy/80',
                    )}
                  >
                    {opcao.texto}
                  </span>
                </div>

                {/* Percentual — aparece só após voto */}
                {hasVoted && (
                  <span
                    className={cn(
                      'ml-3 shrink-0 text-sm font-bold tabular-nums',
                      isVoted ? 'text-[#7c3aed]' : 'text-muted-foreground',
                    )}
                  >
                    {pct}%
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Rodapé da enquete */}
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-semibold text-navy">
          {total.toLocaleString('pt-BR')}
        </span>
        {t.viewer_feed.enquete_total}
        {votedId && (
          <span className="ml-auto text-[#7c3aed]">{t.viewer_feed.enquete_seu_voto}</span>
        )}
        {enquete.encerrada && (
          <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium">
            {t.viewer_feed.enquete_encerrada}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Hook de countdown ────────────────────────────────────────────────────────
function useCountdown(minsLeft: number) {
  const [secs, setSecs] = useState(minsLeft * 60)

  useEffect(() => {
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return {
    formatted: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
    isOver: secs === 0,
  }
}

// ─── Card de Leilão Competitivo 1/1 ──────────────────────────────────────────
export function AuctionCard({ post }: { post: Post & { leilaoCompetitivo: NonNullable<Post['leilaoCompetitivo']> } }) {
  const t = useDict()
  const leilao = post.leilaoCompetitivo
  const { formatted: timeLeft, isOver } = useCountdown(leilao.minsLeft)

  const [currentBid, setCurrentBid]   = useState(leilao.lanceAtual)
  const [userBid,    setUserBid]       = useState('')
  const [processing, setProcessing]   = useState(false)
  const [won,        setWon]           = useState(false)

  const minNext = currentBid + leilao.incrementoMinimo
  const bidValue = parseFloat(userBid)
  const canBid   = !processing && !isOver && !won && !!userBid && bidValue > currentBid

  const handleBid = () => {
    if (!canBid) return
    setProcessing(true)
    setTimeout(() => {
      setCurrentBid(bidValue)
      setUserBid('')
      setProcessing(false)
    }, 1200)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">

      {/* Cabeçalho do Maker */}
      <div className="flex items-center gap-3 border-b border-border bg-secondary/30 px-4 py-3">
        <span className="relative size-10 shrink-0 overflow-hidden rounded-full">
          <Image src={post.maker.avatar} alt={post.maker.name} fill sizes="40px" className="object-cover" />
        </span>
        <div className="flex-1">
          <p className="flex items-center gap-1 text-sm font-semibold text-navy">
            {post.maker.name}
            <ShieldCheck className="size-3.5 text-gold" />
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Flame className="size-3 text-orange-500" />
            {t.auction.hot_label}
          </p>
        </div>
        <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
          {leilao.totalLances} {t.auction.bids_count}
        </span>
      </div>

      {/* Mídia + overlays */}
      <div className="relative h-72 w-full overflow-hidden bg-navy">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.image}
          alt={leilao.titulo}
          className="h-full w-full object-cover opacity-90"
        />

        {/* Cronômetro — topo direito */}
        <div
          className={cn(
            'absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-white shadow-lg backdrop-blur-sm',
            isOver ? 'bg-muted-foreground/80' : 'bg-red-600/90',
          )}
        >
          <Clock className={cn('size-4', !isOver && 'animate-pulse')} />
          {isOver ? t.auction.closed : timeLeft}
        </div>

        {/* Selo 1/1 — baixo esquerdo */}
        {leilao.isExclusivo11 && (
          <div className="absolute bottom-3 left-3 rounded-md border border-gold/40 bg-navy/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold backdrop-blur-sm">
            {t.auction.exclusive_label}
          </div>
        )}
      </div>

      {/* Painel financeiro */}
      <div className="flex flex-col gap-4 p-5">
        <h4 className="font-heading text-base font-bold leading-snug text-navy">
          {leilao.titulo}
        </h4>

        {/* Status do lance */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-secondary px-4 py-3">
          <div>
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t.auction.current_bid}
            </p>
            <p className="font-heading text-3xl font-extrabold leading-none text-navy">
              <span className="mr-1 text-lg text-gold">{t.auction.currency}</span>
              {currentBid.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="mb-0.5 text-[10px] text-muted-foreground">{t.auction.min_next}</p>
            <p className="flex items-center justify-end gap-1 text-sm font-semibold text-navy">
              <TrendingUp className="size-4 text-emerald-600" />
              {t.auction.currency} {minNext.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Sucesso: venceu */}
        {won && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-gold/40 bg-gold/10 py-3 text-sm font-bold text-gold">
            <CheckCircle2 className="size-4" /> {t.auction.winner_label}
          </div>
        )}

        {/* Input de lance */}
        {!won && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-3 flex items-center text-sm font-bold text-navy">
                {t.auction.currency}
              </span>
              <input
                type="number"
                min={minNext}
                step={leilao.incrementoMinimo}
                placeholder={minNext.toFixed(2)}
                value={userBid}
                onChange={(e) => setUserBid(e.target.value)}
                disabled={isOver}
                onKeyDown={(e) => e.key === 'Enter' && handleBid()}
                className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-3 text-sm font-semibold text-navy outline-none focus:border-gold focus:ring-1 focus:ring-gold disabled:opacity-50"
              />
            </div>

            <button
              onClick={handleBid}
              disabled={!canBid}
              className={cn(
                'flex items-center gap-2 rounded-xl bg-gold px-5 text-sm font-extrabold text-navy shadow-md transition-all active:scale-95',
                'hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40',
              )}
            >
              {processing
                ? <Clock className="size-5 animate-spin" />
                : <><Gavel className="size-4" /> {t.auction.place_bid}</>
              }
            </button>
          </div>
        )}

        <p className="text-center text-[11px] text-muted-foreground">
          {t.auction.disclaimer}
        </p>
      </div>
    </div>
  )
}

// ─── Card de postagem individual ─────────────────────────────────────────────
function PostCard({
  post,
  locked,
  showStats,
  onBecomeFiel,
}: {
  post: Post
  locked: boolean
  showStats?: boolean
  onBecomeFiel: () => void
}) {
  const t = useDict()
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)

  // Leilão Competitivo — renderiza AuctionCard em vez do PostCard padrão
  if (post.leilaoCompetitivo) {
    return (
      <div className="mx-auto w-full max-w-xl">
        <AuctionCard post={post as Post & { leilaoCompetitivo: NonNullable<Post['leilaoCompetitivo']> }} />
      </div>
    )
  }

  return (
    <article className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Header do post */}
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="relative size-10 overflow-hidden rounded-full ring-2 ring-gold/40">
            <Image
              src={post.maker.avatar || '/placeholder.svg'}
              alt={post.maker.name}
              fill
              sizes="40px"
              className="object-cover"
            />
          </span>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-navy">{post.maker.name}</p>
              {post.maker.isRookie && (
                <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600 ring-1 ring-emerald-200">
                  Novata ✦
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {post.maker.handle} · {tempoRelativo(post.minsAgo)}
            </p>
          </div>
        </div>

        {/* Badge de tier */}
        <span
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
            post.tier === 'Premium Diamond'
              ? 'border-[#c084fc]/60 text-[#7c3aed]'
              : post.tier === 'Premium Gold'
                ? 'border-gold text-gold'
                : 'border-navy/30 text-navy/70',
          )}
        >
          {post.tier === 'Premium Diamond' ? (
            <Gem className="size-3" />
          ) : post.tier === 'Premium Gold' ? (
            <Crown className="size-3" />
          ) : (
            <span className="size-1.5 rounded-full bg-navy/40" />
          )}
          {post.tier}
        </span>
      </header>

      {/* Body: Enquete substitui completamente a imagem */}
      {post.enquete ? (
        <PollBody enquete={post.enquete} />
      ) : (
        /* Imagem — blur elegante para conteúdo exclusivo */
        <div className="relative aspect-square w-full overflow-hidden">
          <Image
            src={post.image || '/placeholder.svg'}
            alt={post.caption}
            fill
            sizes="(max-width: 768px) 100vw, 576px"
            className={cn('object-cover transition-all duration-500', locked && 'scale-110 blur-2xl')}
          />

          {/* Overlay gradiente — sutil mesmo quando desbloqueado */}
          <div
            className={cn(
              'absolute inset-0',
              locked
                ? 'bg-navy/30 backdrop-blur-[2px]'
                : 'bg-gradient-to-t from-navy/20 to-transparent',
            )}
          />

          {/* Overlay: Leilão de Mimos tem prioridade sobre o lock de assinatura */}
          {post.mimoMeta ? (
            <MimoOverlay meta={post.mimoMeta} />
          ) : (
            locked && <FielCTA onBecomeFiel={onBecomeFiel} />
          )}

          {/* Tag "Degustação" para posts públicos */}
          {!locked && !isExclusive(post) && (
            <span className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-semibold text-navy backdrop-blur-sm">
              {t.viewer_feed.degustacao_livre} ✦
            </span>
          )}

          {/* Badge de tipo de mídia — canto superior direito */}
          {!locked && post.mediaType === 'video' && (
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-navy/80 px-2.5 py-1 text-[11px] font-semibold text-gold backdrop-blur-sm">
              <Play className="size-2.5 fill-gold" /> Video
            </span>
          )}
        </div>
      )}

      {/* Ações */}
      <div className="flex items-center gap-5 px-4 py-3 text-navy">
        {/* ── Botão AMEI — branding emocional ──────────────────────────────── */}
        <button
          type="button"
          aria-label={t.viewer_feed.curtir}
          onClick={() => setLiked((v) => !v)}
          className={cn(
            'flex items-center gap-1.5 transition-all duration-300',
            liked
              ? 'text-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.75)]'
              : 'text-navy/70 hover:text-gold',
          )}
        >
          <Heart
            className={cn('size-6 transition-transform duration-300', liked && 'scale-110')}
            strokeWidth={1.75}
            fill={liked ? 'currentColor' : 'none'}
          />
          {liked && (
            <span className="text-[11px] font-bold tracking-widest text-gold">
              {t.viewer_feed.curtir}
            </span>
          )}
        </button>
        <button
          type="button"
          aria-label={t.viewer_feed.comentar}
          className="transition-colors hover:text-gold"
        >
          <MessageCircle className="size-6" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          aria-label={t.viewer_feed.salvar}
          onClick={() => setSaved((v) => !v)}
          className={cn('ml-auto transition-colors hover:text-gold', saved && 'text-gold')}
        >
          <Bookmark className="size-6" strokeWidth={1.75} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Legenda + métricas — oculto para enquetes (PollBody já tem rodapé) */}
      {!post.enquete && (
      <div className="px-4 pb-4">
        {/* Footer especial para Leilão de Mimos */}
        {post.mimoMeta ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <LilioRosaIcon size={16} />
              <p className="text-sm font-semibold text-navy">{post.maker.name}</p>
            </div>
            <p className="text-xs text-muted-foreground">{post.caption}</p>
            <MimoProgressBar
              alvo={post.mimoMeta.alvo}
              arrecadado={post.mimoMeta.arrecadado}
              compact
            />
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-gold">
              {(post.likes + (liked ? 1 : 0)).toLocaleString('pt-BR')} {t.viewer_feed.curtidas}
            </p>
            <p className="mt-0.5 text-sm text-navy">
              <span className="font-semibold">{post.maker.name}</span>{' '}
              {locked ? (
                <span className="italic text-muted-foreground">
                  {t.viewer_feed.desbloquear_legenda}
                </span>
              ) : (
                post.caption
              )}
            </p>

            {showStats && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-navy">
                  <Eye className="size-3.5" /> {post.views.toLocaleString('pt-BR')} views
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-medium text-navy">
                  <TrendingUp className="size-3.5 text-gold" /> {post.sales} {t.viewer_feed.vendas}
                </span>
              </div>
            )}
          </>
        )}
      </div>
      )}
    </article>
  )
}

// ─── Tipos de filtro de mídia ─────────────────────────────────────────────────
type MediaFilter = 'all' | 'photo' | 'video'

// ─── FeedHeader: busca + filtros pill ────────────────────────────────────────
type FeedHeaderProps = {
  mediaFilter: MediaFilter
  onMediaFilter: (f: MediaFilter) => void
  counts: { all: number; photo: number; video: number }
  searchQuery: string
  onSearch: (q: string) => void
}

function FeedHeader({ mediaFilter, onMediaFilter, counts, searchQuery, onSearch }: FeedHeaderProps) {
  const t = useDict()

  const pills: { key: MediaFilter; label: string; icon: typeof LayoutGrid; count: number }[] = [
    { key: 'all',   label: t.viewer_feed.filter_all,    icon: LayoutGrid, count: counts.all   },
    { key: 'photo', label: t.viewer_feed.filter_photos, icon: ImageIcon,  count: counts.photo },
    { key: 'video', label: t.viewer_feed.filter_videos, icon: Play,       count: counts.video },
  ]

  return (
    <div className="border-b border-border bg-background px-6 pb-5 pt-5">
      <div className="mx-auto flex max-w-xl flex-col gap-3">
      {/* Barra de busca */}
      <div className="relative">
        <Search
          className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60"
          strokeWidth={1.75}
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={t.viewer_feed.search_placeholder}
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-10 text-sm text-navy outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-gold focus:ring-1 focus:ring-gold/40"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearch('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-navy"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* Filtros pill */}
      <div className="flex items-center gap-2">
        {pills.map(({ key, label, icon: Icon, count }) => {
          const active = mediaFilter === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onMediaFilter(key)}
              className={cn(
                'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all',
                active
                  ? 'border-navy bg-navy text-primary-foreground shadow-sm'
                  : 'border-border text-navy/60 hover:border-navy/40 hover:text-navy',
              )}
            >
              <Icon
                className={cn('size-3.5 shrink-0', active ? 'text-gold' : 'text-navy/40')}
                strokeWidth={2}
              />
              {label}
              <span
                className={cn(
                  'min-w-[18px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold',
                  active ? 'bg-gold/25 text-gold' : 'bg-secondary text-muted-foreground',
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>
      </div>
    </div>
  )
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export function FeedScreen() {
  const { accountType, isSubscribedTo, subscribeTo, navigate } = useApp()
  const t = useDict()
  const [tab, setTab] = useState<Tab>('alta')
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const isMaker = accountType === 'maker'

  // Labels das tabs resolvidas pelo dicionário ativo
  const tabLabel: Record<Tab, string> = {
    alta:    t.viewer_feed.tab_alta,
    recente: t.viewer_feed.tab_recente,
    novatos: t.viewer_feed.tab_novatos,
  }

  // ── Algoritmo de Inteligência de Ordenação ──────────────────────────────────
  // Posts ordenados/filtrados pela tab ativa — base para contagens e filtragem
  const visiblePosts = useMemo(() => {
    const base = isMaker
      ? allPosts.filter((p) => p.maker.id === currentMaker.id)
      : allPosts

    const list = [...base]

    if (tab === 'alta') {
      // Score de engajamento: likes têm peso alto, views moderado, sales determinante
      return list.sort((a, b) => {
        const scoreA = a.likes * 2 + a.views * 0.01 + a.sales * 50
        const scoreB = b.likes * 2 + b.views * 0.01 + b.sales * 50
        return scoreB - scoreA
      })
    }

    if (tab === 'recente') {
      // Ordem cronológica reversa: menor minsAgo = mais recente = primeiro
      return list.sort((a, b) => a.minsAgo - b.minsAgo)
    }

    if (tab === 'novatos') {
      // Apenas posts de Makers recém-ingressadas, ordenadas por recência
      return list
        .filter((p) => p.maker.isRookie === true)
        .sort((a, b) => a.minsAgo - b.minsAgo)
    }

    return list
  }, [isMaker, tab])

  // Contagens por tipo de mídia (baseadas nos posts já ordenados pela tab)
  const photosCount = useMemo(() => visiblePosts.filter((p) => p.mediaType === 'photo').length, [visiblePosts])
  const videosCount = useMemo(() => visiblePosts.filter((p) => p.mediaType === 'video').length, [visiblePosts])

  // Posts filtrados pelo tipo de mídia E pela busca textual
  const filteredPosts = useMemo(() => {
    let result = visiblePosts
    if (mediaFilter === 'photo') result = result.filter((p) => p.mediaType === 'photo')
    if (mediaFilter === 'video') result = result.filter((p) => p.mediaType === 'video')
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.caption.toLowerCase().includes(q) ||
          p.maker.name.toLowerCase().includes(q) ||
          p.maker.handle.toLowerCase().includes(q),
      )
    }
    return result
  }, [visiblePosts, mediaFilter, searchQuery])

  /**
   * Verifica se um post está bloqueado para o usuário atual:
   * — Makers sempre veem tudo (seus próprios posts)
   * — Espectador vê livre apenas se assinou aquele maker específico (ou tem acesso global '*')
   */
  const isPostLocked = (post: Post) =>
    !isMaker && isExclusive(post) && !isSubscribedTo(post.maker.id)

  /**
   * CTA por post: assina o maker daquele post específico, depois navega
   * para a tela de assinaturas para completar o fluxo de pagamento.
   */
  const handleBecomeFiel = (makerId: string) => {
    subscribeTo(makerId)
    navigate('assinaturas')
  }

  // Verdadeiro enquanto houver ao menos um post bloqueado nos posts filtrados
  const hasLockedPosts = !isMaker && filteredPosts.some(isPostLocked)

  return (
    <div>
      {/* ── FeedHeader: busca + filtros pill — ACIMA do carrossel ─────────────── */}
      <FeedHeader
        mediaFilter={mediaFilter}
        onMediaFilter={setMediaFilter}
        counts={{ all: visiblePosts.length, photo: photosCount, video: videosCount }}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
      />

      {/* Carrossel de Makers em Destaque — visível apenas para Espectador */}
      {!isMaker && <MakersCarousel />}

      {/* Tabs de navegação */}
      <nav className="sticky top-[69px] z-10 flex items-center justify-center gap-1 border-b border-border bg-background/90 px-6 py-3 backdrop-blur">
        {TAB_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              'rounded-full px-4 py-2 text-sm transition-colors',
              tab === key
                ? 'bg-navy font-medium text-primary-foreground'
                : 'text-navy/60 hover:text-navy',
            )}
          >
            {tabLabel[key]}
          </button>
        ))}
      </nav>

      {/* Banner explicativo — só aparece quando há posts bloqueados no feed atual */}
      {hasLockedPosts && (
        <div className="mx-auto mt-4 max-w-xl px-6">
          <div className="flex items-start gap-3 rounded-xl border border-gold/30 bg-gold/5 px-4 py-3">
            <Crown className="mt-0.5 size-4 shrink-0 text-gold" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t.viewer_feed.banner_antes}
              <span className="font-semibold text-navy">{t.viewer_feed.banner_destaque}</span>
              {t.viewer_feed.banner_depois}
            </p>
          </div>
        </div>
      )}

      {/* Feed de posts */}
      <div className="flex flex-col gap-8 px-6 py-8">
        {filteredPosts.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {t.viewer_feed.empty}
          </p>
        )}

        {filteredPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            locked={isPostLocked(post)}
            showStats={isMaker}
            // Pre-bind o makerId ao callback — PostCard/FielCTA disparam sem precisar saber o ID
            onBecomeFiel={() => handleBecomeFiel(post.maker.id)}
          />
        ))}
      </div>

      {/* Rodapé CTA global — navega para assinaturas sem pré-selecionar um maker */}
      {hasLockedPosts && (
        <div className="mx-auto mb-12 flex max-w-xl flex-col items-center gap-4 px-6 text-center">
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
          <p className="font-heading text-lg italic text-navy">{t.viewer_feed.rodape_titulo}</p>
          <p className="text-sm text-muted-foreground">{t.viewer_feed.rodape_descricao}</p>
          <button
            type="button"
            onClick={() => navigate('assinaturas')}
            className="rounded-xl border-2 border-gold bg-gold px-8 py-3 text-sm font-bold tracking-wide text-navy shadow-md transition-opacity hover:opacity-90"
          >
            {t.viewer_feed.rodape_cta}
          </button>
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>
      )}
    </div>
  )
}
