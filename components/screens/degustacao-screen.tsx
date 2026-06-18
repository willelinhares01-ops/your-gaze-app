'use client'

import Image from 'next/image'
import { Play, Lock, EyeOff } from 'lucide-react'
import { posts, makers } from '@/lib/data'
import { useApp } from '@/components/app-context'
import { cn } from '@/lib/utils'

// "open" = o Maker liberou esta degustação sem desfoque (foto nítida ou vídeo
// curto de 10s liberado). Quando false, fica desfocado/travado até assinar.
const media = [
  { ...posts[0], type: 'foto' as const, open: true },
  { ...posts[1], type: 'video' as const, dur: '0:10', open: true },
  { ...posts[2], type: 'foto' as const, open: false },
  { id: 'd4', maker: makers[1], image: '/post-1.png', type: 'video' as const, dur: '0:10', open: false },
  { id: 'd5', maker: makers[4], image: '/post-2.png', type: 'foto' as const, open: true },
  { id: 'd6', maker: makers[3], image: '/post-3.png', type: 'video' as const, dur: '0:10', open: false },
]

export function DegustacaoScreen() {
  const { isFiel } = useApp()

  return (
    <div className="px-6 py-8">
      <header className="mx-auto mb-6 max-w-4xl">
        <h2 className="font-heading text-2xl text-navy">Degustação</h2>
        <p className="text-sm text-muted-foreground">
          {isFiel
            ? 'Mídias originais e sem desfoque — aproveite.'
            : 'Prove um pouco do que o Maker cria. Cada Maker decide o que liberar: fotos nítidas e vídeos de 10s sem desfoque. O restante fica embaçado até você assinar.'}
        </p>
      </header>

      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-3">
        {media.map((m) => {
          // Mostra nítido se já é Fiel OU se o Maker liberou esta degustação.
          const revealed = isFiel || m.open
          return (
            <figure
              key={m.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border"
            >
              <Image
                src={m.image || '/placeholder.svg'}
                alt={`Degustação de ${m.maker.name}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className={cn('object-cover', !revealed && 'blur-xl scale-110')}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-navy/20">
                {!revealed && (
                  <span className="flex size-11 items-center justify-center rounded-full bg-background/85 text-gold">
                    {m.type === 'video' ? (
                      <Lock className="size-5" />
                    ) : (
                      <EyeOff className="size-5" />
                    )}
                  </span>
                )}
                {revealed && m.type === 'video' && (
                  <span className="flex size-11 items-center justify-center rounded-full bg-background/85 text-navy">
                    <Play className="size-5" fill="currentColor" />
                  </span>
                )}
              </div>
              {m.type === 'video' && (
                <figcaption className="absolute bottom-2 right-2 rounded-md bg-navy/80 px-2 py-0.5 text-xs font-medium text-gold">
                  {revealed ? 'Vídeo 0:10' : `Teaser ${m.dur}`}
                </figcaption>
              )}
              {!isFiel && m.open && (
                <span className="absolute left-2 top-2 rounded-md bg-gold/90 px-2 py-0.5 text-xs font-semibold text-navy">
                  Liberado pelo Maker
                </span>
              )}
            </figure>
          )
        })}
      </div>
    </div>
  )
}
