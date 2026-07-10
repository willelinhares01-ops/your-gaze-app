'use client'

import { useState } from 'react'
import { ShieldCheck, Star, Users, FileImage, Gavel } from 'lucide-react'
import { useDict } from '@/lib/locale-context'
import { useApp } from '@/components/app-context'
import { currentMaker, posts, type Post } from '@/lib/data'
import { MakerProfileAuctions } from '@/components/screens/maker/maker-profile-auctions'
import { cn } from '@/lib/utils'

// ─── Mock stats para o perfil ─────────────────────────────────────────────────

const PROFILE_STATS = {
  seguidores: 1_240,
}

// ─── Filtra posts do Maker logado ─────────────────────────────────────────────

function useMakerPosts() {
  const myPosts = posts.filter((p) => p.maker.id === currentMaker.id)
  const auctionCount = myPosts.filter((p) => p.leilaoCompetitivo !== undefined).length
  return { myPosts, auctionCount }
}

// ─── Componente de Aba ────────────────────────────────────────────────────────

type Tab = 'posts' | 'auctions' | 'sobre'

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 py-3 text-sm font-semibold tracking-wide transition-colors border-b-2',
        active
          ? 'border-gold text-navy'
          : 'border-transparent text-navy/50 hover:text-navy',
      )}
    >
      {children}
    </button>
  )
}

// ─── Mini card de post (aba Posts) ────────────────────────────────────────────

function PostMiniCard({ post }: { post: Post }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card aspect-square group cursor-pointer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={post.image}
        alt={post.caption}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
        <p className="text-white text-xs font-medium line-clamp-2">{post.caption}</p>
        <div className="flex items-center gap-1 mt-1 text-gold text-xs">
          <Star className="size-3" strokeWidth={1.5} />
          {post.likes.toLocaleString()}
        </div>
      </div>
      {/* Badge de tier */}
      <span className="absolute top-2 right-2 rounded-full bg-navy/80 px-2 py-0.5 text-[10px] font-semibold text-gold uppercase tracking-wider">
        {post.tier.replace('Premium ', '')}
      </span>
    </div>
  )
}

// ─── Aba Sobre ────────────────────────────────────────────────────────────────

function SobreTab({ t }: { t: ReturnType<typeof useDict> }) {
  return (
    <div className="space-y-5 py-4">
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <p className="text-sm text-navy leading-relaxed">{t.profile.bio_default}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-3">
          <span className="font-medium text-navy">{t.profile.since_label}:</span>
          {t.profile.joined}
        </div>
      </div>

      {/* Estatísticas detalhadas */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t.profile.stat_posts,      value: posts.filter((p) => p.maker.id === currentMaker.id).length },
          { label: t.profile.stat_seguidores,  value: PROFILE_STATS.seguidores.toLocaleString() },
          { label: t.profile.stat_lances,      value: PROFILE_STATS.lancesAtivos },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-2xl font-extrabold text-navy">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tela Principal ───────────────────────────────────────────────────────────

export function PerfilScreen() {
  const t = useDict()
  const { accountType } = useApp()
  const [tab, setTab] = useState<Tab>('posts')
  const { myPosts, auctionCount } = useMakerPosts()

  if (accountType !== 'maker') return null

  return (
    <div className="mx-auto max-w-3xl px-4 pb-12 pt-6">

      {/* ── Cabeçalho do perfil ── */}
      <div className="flex flex-col items-center gap-4 mb-8">
        {/* Avatar */}
        <div className="relative">
          <div className="size-24 rounded-full bg-navy/10 border-2 border-gold overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentMaker.avatar}
              alt={currentMaker.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '' }}
            />
          </div>
          <span className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-gold shadow-md">
            <ShieldCheck className="size-4 text-navy" strokeWidth={2} />
          </span>
        </div>

        {/* Nome + handle */}
        <div className="text-center">
          <h1 className="font-heading text-2xl text-navy font-bold">{currentMaker.name}</h1>
          <p className="text-sm text-muted-foreground">{currentMaker.handle}</p>
        </div>

        {/* Stats resumidos */}
        <div className="flex items-center gap-6 text-center">
          <div>
            <p className="text-lg font-extrabold text-navy">
              {myPosts.length}
            </p>
            <p className="text-xs text-muted-foreground">{t.profile.stat_posts}</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <p className="text-lg font-extrabold text-navy">
              {PROFILE_STATS.seguidores.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{t.profile.stat_seguidores}</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <p className="text-lg font-extrabold text-gold">
              {auctionCount}
            </p>
            <p className="text-xs text-muted-foreground">{t.profile.stat_lances}</p>
          </div>
        </div>
      </div>

      {/* ── Abas ── */}
      <div className="flex border-b border-border mb-6">
        <TabButton active={tab === 'posts'} onClick={() => setTab('posts')}>
          <span className="flex items-center justify-center gap-1.5">
            <FileImage className="size-4" />
            {t.profile.tab_posts}
          </span>
        </TabButton>
        <TabButton active={tab === 'auctions'} onClick={() => setTab('auctions')}>
          <span className="flex items-center justify-center gap-1.5">
            <Gavel className="size-4" />
            {t.profile.tab_auctions}
            {auctionCount > 0 && (
              <span className="ml-1 rounded-full bg-gold/20 text-gold px-1.5 py-0.5 text-[10px] font-bold uppercase">
                {auctionCount} {t.profile.active_badge}
              </span>
            )}
          </span>
        </TabButton>
        <TabButton active={tab === 'sobre'} onClick={() => setTab('sobre')}>
          <span className="flex items-center justify-center gap-1.5">
            <Users className="size-4" />
            {t.profile.tab_sobre}
          </span>
        </TabButton>
      </div>

      {/* ── Conteúdo das Abas ── */}

      {/* Posts */}
      {tab === 'posts' && (
        myPosts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {myPosts.map((p) => (
              <PostMiniCard key={p.id} post={p} />
            ))}
          </div>
        ) : (
          <EmptyState message={t.profile.no_posts} />
        )
      )}

      {/* Leilões Ativos */}
      {tab === 'auctions' && <MakerProfileAuctions />}

      {/* Sobre */}
      {tab === 'sobre' && <SobreTab t={t} />}
    </div>
  )
}

// ─── Estado vazio ─────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-2xl text-center">
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  )
}
