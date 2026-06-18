'use client'

import Image from 'next/image'
import { Plus } from 'lucide-react'
import { currentUser, makers } from '@/lib/data'

export function Stories({ canCreate = false }: { canCreate?: boolean }) {
  return (
    <section
      aria-label="Histórias"
      className="flex gap-5 overflow-x-auto border-b border-border px-6 py-6"
    >
      {/* "Sua história" só para Maker — o Espectador apenas assiste às dos Makers. */}
      {canCreate && (
        <div className="flex w-20 shrink-0 flex-col items-center gap-2">
          <button
            type="button"
            className="relative size-20 rounded-full ring-2 ring-gold ring-offset-2 ring-offset-background"
            aria-label="Adicionar sua história"
          >
            <Image
              src={currentUser.avatar || '/placeholder.svg'}
              alt="Sua foto"
              fill
              sizes="80px"
              className="rounded-full object-cover"
            />
            <span className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-background bg-gold text-navy">
              <Plus className="size-4" strokeWidth={3} />
            </span>
          </button>
          <span className="truncate text-xs font-medium text-navy">Sua história</span>
        </div>
      )}

      {/* Histórias dos Makers */}
      {makers.map((maker) => (
        <div key={maker.id} className="flex w-20 shrink-0 flex-col items-center gap-2">
          <button
            type="button"
            className="size-20 rounded-full bg-gradient-to-tr from-gold to-navy p-[2px]"
            aria-label={`História de ${maker.name}`}
          >
            <span className="relative block size-full rounded-full border-2 border-background">
              <Image
                src={maker.avatar || '/placeholder.svg'}
                alt={maker.name}
                fill
                sizes="80px"
                className="rounded-full object-cover"
              />
            </span>
          </button>
          <span className="truncate text-xs text-navy/70">{maker.name}</span>
        </div>
      ))}
    </section>
  )
}
