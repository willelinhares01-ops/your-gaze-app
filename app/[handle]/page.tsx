import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ShieldCheck,
  Crown,
  ImageIcon,
  Video,
  Gavel,
  Gift,
  Lock,
} from 'lucide-react'

import { makers, posts, tiers, type Maker, type Post } from '@/lib/data'
import { AvatarRing, makerRingVariant } from '@/components/ui/avatar-ring'
import { SubscribeCta } from './_components/subscribe-cta'
import { AdPlacement } from '@/components/monetization/AdPlacement'

// ─── SSG: pré-gera todas as rotas em build ────────────────────────────────────

export function generateStaticParams() {
  return makers.map((m) => ({
    handle: encodeURIComponent(m.handle),
  }))
}

// ─── OG Dinâmico por Maker ────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { handle: string }
}): Promise<Metadata> {
  const maker = resolveMaker(params.handle)
  if (!maker) return {}

  const isFounder =
    typeof maker.founderNumber === 'number' && maker.founderNumber <= 1000
  const title = `${maker.name} (${maker.handle}) — Your Gaze`
  const description =
    maker.bio ??
    `Conteúdo exclusivo de ${maker.name} na plataforma Your Gaze — Chat PPV, Leilões e assinaturas em USD ($).${isFounder ? ' Maker Fundadora.' : ''}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://yourgaze.space/${encodeURIComponent(maker.handle)}`,
      images: [{ url: maker.avatar, width: 400, height: 400, alt: maker.name }],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [maker.avatar],
      creator: maker.handle,
    },
    alternates: {
      canonical: `https://yourgaze.space/${encodeURIComponent(maker.handle)}`,
    },
  }
}

// ─── Helper: resolver Maker pelo handle da URL ────────────────────────────────

function resolveMaker(rawHandle: string): Maker | undefined {
  const decoded = decodeURIComponent(rawHandle)
  return makers.find(
    (m) => m.handle.toLowerCase() === decoded.toLowerCase(),
  )
}

// ─── Helpers de formatação ────────────────────────────────────────────────────

function makerPosts(maker: Maker): Post[] {
  return posts.filter((p) => p.maker.id === maker.id)
}

function tierBadgeColor(tier: Post['tier']) {
  if (tier === 'Premium Diamond') return 'bg-sky-950 text-sky-300 border-sky-700'
  if (tier === 'Premium Gold')    return 'bg-amber-950 text-amber-300 border-amber-700'
  return                                  'bg-slate-800 text-slate-300 border-slate-600'
}

// ─── Sub-componentes (Server) ─────────────────────────────────────────────────

function CoverBanner({ maker }: { maker: Maker }) {
  const isFounder =
    typeof maker.founderNumber === 'number' && maker.founderNumber <= 1000

  return (
    <div className="relative w-full h-52 sm:h-64 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 border-b-4 border-amber-500/60 overflow-hidden">
      {/* Padrão decorativo */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #D4AF37 0, #D4AF37 1px, transparent 0, transparent 50%)',
          backgroundSize: '18px 18px',
        }}
      />

      {/* Badge Fundadora no canto superior direito */}
      {isFounder && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-amber-400/10 border border-amber-400/40 px-3 py-1">
          <Crown className="size-3.5 text-amber-400" />
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
            Maker Fundadora #{maker.founderNumber}
          </span>
        </div>
      )}

      {/* Avatar — centralizado e sobreposição à capa */}
      <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
        <div className="ring-4 ring-white rounded-full">
          <AvatarRing
            src={maker.avatar}
            alt={maker.name}
            size="xl"
            variant={makerRingVariant(maker)}
          />
        </div>
      </div>
    </div>
  )
}

function ProfileInfo({ maker }: { maker: Maker }) {
  return (
    <div className="mt-16 text-center px-4">
      <h1 className="text-3xl font-serif font-bold text-slate-950">
        {maker.name}
      </h1>

      <p className="mt-1 text-sm font-semibold text-amber-600 tracking-wide">
        {maker.handle}
      </p>

      {/* Badges de status */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {maker.kycStatus === 'VERIFIED' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="size-3.5" />
            Verificada · Yoti KYC
          </span>
        )}
        {typeof maker.founderNumber === 'number' && maker.founderNumber <= 1000 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-300 px-2.5 py-0.5 text-xs font-bold text-amber-700">
            <Crown className="size-3.5" />
            Maker Fundadora
          </span>
        )}
      </div>

      {maker.bio && (
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600">
          {maker.bio}
        </p>
      )}
    </div>
  )
}

function StatsBar({ maker }: { maker: Maker }) {
  const mp = makerPosts(maker)
  const photos = mp.filter((p) => p.mediaType === 'photo').length
  const videos = mp.filter((p) => p.mediaType === 'video').length
  const auctions = mp.filter((p) => p.leilaoCompetitivo).length

  return (
    <div className="mt-8 mx-auto flex max-w-sm divide-x divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {[
        { icon: <ImageIcon className="size-4 text-amber-500" />, label: 'Fotos',   value: photos  },
        { icon: <Video      className="size-4 text-sky-500"   />, label: 'Vídeos',  value: videos  },
        { icon: <Gavel      className="size-4 text-rose-500"  />, label: 'Leilões', value: auctions },
      ].map(({ icon, label, value }) => (
        <div key={label} className="flex flex-1 flex-col items-center py-3 px-2 gap-0.5">
          {icon}
          <span className="text-xl font-extrabold text-slate-900">{value}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

function SubscriptionSection({ maker }: { maker: Maker }) {
  return (
    <section className="mx-auto mt-10 max-w-5xl px-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-slate-950">
          Planos de Acesso
        </h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
          Repasse 85% ao Maker
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.filter((t) => t.id !== 'courses').map((tier) => {
          const isDiamond = tier.id === 'diamond'
          const isGold    = tier.id === 'gold'
          return (
            <div
              key={tier.id}
              className={`relative flex flex-col rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md ${
                isDiamond
                  ? 'border-sky-300 bg-gradient-to-b from-sky-950 to-slate-950 text-white'
                  : isGold
                  ? 'border-amber-300 bg-gradient-to-b from-amber-950 to-slate-950 text-white'
                  : 'border-slate-200 bg-white text-slate-900'
              }`}
            >
              {isDiamond && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-sky-400 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow">
                  VIP
                </span>
              )}
              <p className={`text-xs font-black uppercase tracking-wider ${isDiamond || isGold ? 'text-amber-400' : 'text-amber-600'}`}>
                {tier.name}
              </p>
              <p className="mt-1 text-xl font-extrabold">{tier.price}</p>
              <ul className="mt-3 space-y-1.5 flex-1">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-1.5 text-xs leading-snug opacity-90">
                    <span className="mt-0.5 text-amber-400">✓</span>
                    {perk}
                  </li>
                ))}
              </ul>
              <SubscribeCta
                makerHandle={maker.handle}
                tierName={tier.name}
                isFeatured={isDiamond || isGold}
              />
            </div>
          )
        })}
      </div>

      <p className="mt-3 text-center text-[11px] text-slate-400">
        O Maker possui autonomia total para customizar valores, enviar convites gratuitos ou conceder descontos dentro destas faixas.
      </p>
    </section>
  )
}

function PostGrid({ maker }: { maker: Maker }) {
  const mp = makerPosts(maker)

  if (mp.length === 0) {
    return (
      <div className="mx-auto mt-12 max-w-5xl px-4 text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
        <p className="text-slate-400 text-sm">Nenhuma publicação ainda.</p>
      </div>
    )
  }

  return (
    <section className="mx-auto mt-10 max-w-5xl px-4 pb-20">
      <h2 className="mb-4 font-serif text-xl font-bold text-slate-950">
        Publicações
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {mp.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  )
}

function PostCard({ post }: { post: Post }) {
  const hasAuction = !!post.leilaoCompetitivo
  const hasMimo    = !!post.mimoMeta
  const hasEnquete = !!post.enquete

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 aspect-square shadow-sm hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      {hasEnquete ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-2">Enquete</span>
          <p className="text-[11px] text-white text-center leading-snug line-clamp-3">
            {post.enquete!.pergunta}
          </p>
        </div>
      ) : (
        <img
          src={post.image}
          alt={post.caption || 'Conteúdo exclusivo'}
          className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      )}

      {/* Overlay escuro permanente no bottom */}
      {!hasEnquete && (
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent" />
      )}

      {/* Lock */}
      {!hasEnquete && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="rounded-full bg-black/60 p-2">
            <Lock className="size-5 text-white" />
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {hasAuction && (
          <span className="inline-flex items-center gap-1 rounded bg-rose-600/90 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
            <Gavel className="size-2.5" /> Leilão
          </span>
        )}
        {hasMimo && (
          <span className="inline-flex items-center gap-1 rounded bg-pink-600/90 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
            <Gift className="size-2.5" /> Meta
          </span>
        )}
      </div>

      {/* Tier badge */}
      <div className="absolute top-2 right-2">
        <span className={`rounded border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${tierBadgeColor(post.tier)}`}>
          {post.tier === 'Premium Diamond' ? '💎' : post.tier === 'Premium Gold' ? '✦' : '·'} {post.tier.replace('Premium ', '')}
        </span>
      </div>

      {/* Caption */}
      {post.caption && !hasEnquete && (
        <p className="absolute bottom-2 left-2 right-2 text-[11px] leading-snug text-white/90 line-clamp-2">
          {post.caption}
        </p>
      )}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function MakerProfilePage({
  params,
}: {
  params: { handle: string }
}) {
  const maker = resolveMaker(params.handle)
  if (!maker) notFound()

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Barra de retorno */}
      <nav className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-md">
        <Link
          href="/"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          ← Your Gaze
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-bold text-amber-600">{maker.handle}</span>
      </nav>

      {/* Capa */}
      <CoverBanner maker={maker} />

      {/* Info */}
      <ProfileInfo maker={maker} />

      {/* Stats */}
      <div className="flex justify-center">
        <StatsBar maker={maker} />
      </div>

      {/* Assinaturas */}
      <SubscriptionSection maker={maker} />

      {/* Monetização passiva — Ads Engine (entre bio e conteúdos) */}
      <AdPlacement makerHandle={maker.handle} />

      {/* Grid de Posts */}
      <PostGrid maker={maker} />
    </main>
  )
}
