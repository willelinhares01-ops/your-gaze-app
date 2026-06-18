'use client'

import Image from 'next/image'
import { Heart, MessageCircle, Bookmark, Lock, Eye, TrendingUp } from 'lucide-react'
import type { Post } from '@/lib/data'

function tempoRelativo(minsAgo: number) {
  if (minsAgo < 60) return `há ${minsAgo} min`
  const h = Math.floor(minsAgo / 60)
  if (h < 24) return `há ${h} h`
  return `há ${Math.floor(h / 24)} d`
}

export function Feed({ posts, showStats }: { posts: Post[]; showStats?: boolean }) {
  if (posts.length === 0) {
    return (
      <p className="px-6 py-16 text-center text-sm text-muted-foreground">
        Nenhuma postagem por aqui ainda.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-8 px-6 py-8">
      {posts.map((post) => (
        <article
          key={post.id}
          className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card"
        >
          <header className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="relative size-10 overflow-hidden rounded-full">
                <Image
                  src={post.maker.avatar || '/placeholder.svg'}
                  alt={post.maker.name}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-navy">{post.maker.name}</p>
                <p className="text-xs text-muted-foreground">
                  {post.maker.handle} · {tempoRelativo(post.minsAgo)}
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-gold px-3 py-1 text-xs font-medium text-gold">
              <Lock className="size-3" strokeWidth={2} />
              {post.tier}
            </span>
          </header>

          <div className="relative aspect-square w-full">
            <Image
              src={post.image || '/placeholder.svg'}
              alt={post.caption}
              fill
              sizes="(max-width: 768px) 100vw, 576px"
              className="object-cover"
            />
          </div>

          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-5 text-navy">
              <button type="button" aria-label="Curtir" className="hover:text-gold">
                <Heart className="size-6" strokeWidth={1.75} />
              </button>
              <button type="button" aria-label="Comentar" className="hover:text-gold">
                <MessageCircle className="size-6" strokeWidth={1.75} />
              </button>
              <button type="button" aria-label="Salvar" className="ml-auto hover:text-gold">
                <Bookmark className="size-6" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          <div className="px-4 pb-4">
            <p className="text-sm font-semibold text-gold">
              {post.likes.toLocaleString('pt-BR')} curtidas
            </p>
            <p className="mt-1 text-sm text-navy">
              <span className="font-semibold">{post.maker.name}</span> {post.caption}
            </p>

            {showStats && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-navy">
                  <Eye className="size-3.5" /> {post.views.toLocaleString('pt-BR')} views
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-medium text-navy">
                  <TrendingUp className="size-3.5 text-gold" /> {post.sales} vendas
                </span>
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
