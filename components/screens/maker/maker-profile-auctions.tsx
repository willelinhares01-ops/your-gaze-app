'use client'

import { useDict } from '@/lib/locale-context'
import { currentMaker, posts, type Post } from '@/lib/data'
import { AuctionCard } from '@/components/screens/feed-screen'

type AuctionPost = Post & { leilaoCompetitivo: NonNullable<Post['leilaoCompetitivo']> }

function useActiveAuctions(): AuctionPost[] {
  return posts.filter(
    (p): p is AuctionPost =>
      p.maker.id === currentMaker.id && p.leilaoCompetitivo !== undefined,
  )
}

export function MakerProfileAuctions() {
  const t = useDict()
  const activeAuctions = useActiveAuctions()

  return (
    <div className="p-4 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-navy">
          {t.profile.tab_auctions}
        </h2>
        <span className="rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold text-gold uppercase tracking-wide">
          {activeAuctions.length} {t.profile.active_badge}
        </span>
      </div>

      {/* Grid de cards */}
      {activeAuctions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeAuctions.map((post) => (
            <AuctionCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-20 border-2 border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground text-sm">{t.profile.no_auctions}</p>
        </div>
      )}
    </div>
  )
}
