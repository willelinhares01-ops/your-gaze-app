'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Send, ShoppingBag, Ban, ShieldX } from 'lucide-react'
import { chatThreads, sampleMessages } from '@/lib/data'
import { useApp } from '@/components/app-context'
import { cn } from '@/lib/utils'

export function ChatScreen() {
  const { accountType } = useApp()
  const isMaker = accountType === 'maker'
  const [active, setActive] = useState(0)
  const [blocked, setBlocked] = useState(false)
  const thread = chatThreads[active]

  return (
    <div className="mx-auto flex h-[calc(100vh-69px)] max-w-4xl">
      {/* Lista de conversas */}
      <aside className="w-64 shrink-0 border-r border-border">
        <p className="px-4 py-4 text-sm font-semibold text-navy">Conversas</p>
        {chatThreads.map((t, i) => (
          <button
            key={t.maker.id}
            onClick={() => {
              setActive(i)
              setBlocked(false)
            }}
            className={cn(
              'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary',
              i === active && 'bg-secondary',
            )}
          >
            <span className="relative size-10 shrink-0 overflow-hidden rounded-full">
              <Image src={t.maker.avatar} alt={t.maker.name} fill sizes="40px" className="object-cover" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-navy">{t.maker.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{t.lastMessage}</span>
            </span>
            {t.unread > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-navy">
                {t.unread}
              </span>
            )}
          </button>
        ))}
      </aside>

      {/* Conversa */}
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="relative size-9 overflow-hidden rounded-full">
              <Image src={thread.maker.avatar} alt={thread.maker.name} fill sizes="36px" className="object-cover" />
            </span>
            <p className="text-sm font-semibold text-navy">{thread.maker.name}</p>
          </div>
          {/* Botão de block é exclusivo do Maker */}
          {isMaker && (
            <button
              onClick={() => setBlocked((b) => !b)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                blocked
                  ? 'border-destructive bg-destructive/10 text-destructive'
                  : 'border-border text-navy hover:border-destructive hover:text-destructive',
              )}
            >
              <Ban className="size-3.5" />
              {blocked ? 'Espectador bloqueado' : 'Dar Block no Espectador'}
            </button>
          )}
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto bg-secondary/30 p-4">
          {sampleMessages.map((m) => (
            <div key={m.id} className={cn('flex', m.from === 'me' ? 'justify-end' : 'justify-start')}>
              {m.media ? (
                <div className="max-w-xs rounded-2xl border border-gold bg-gold/10 p-4 text-center">
                  <p className="mb-2 text-sm font-medium text-navy">{m.text}</p>
                  {!isMaker && (
                    <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-2 text-sm font-semibold text-navy hover:opacity-90">
                      <ShoppingBag className="size-4" />
                      Comprar Mídia Avulsa · {m.media.price}
                    </button>
                  )}
                  <p className="mt-1 text-[10px] text-muted-foreground">Pagamento via Stripe</p>
                </div>
              ) : (
                <p
                  className={cn(
                    'max-w-xs rounded-2xl px-4 py-2 text-sm',
                    m.from === 'me' ? 'bg-navy text-primary-foreground' : 'bg-card text-navy border border-border',
                  )}
                >
                  {m.text}
                </p>
              )}
            </div>
          ))}
        </div>

        {blocked ? (
          <div className="flex items-center justify-center gap-2 border-t border-border px-4 py-4 text-sm text-destructive">
            <ShieldX className="size-4" /> Você bloqueou este Espectador.
          </div>
        ) : (
          <div className="flex items-center gap-2 border-t border-border px-4 py-3">
            <input
              placeholder="Escreva uma mensagem..."
              className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-gold"
            />
            <button className="flex size-10 items-center justify-center rounded-full bg-gold text-navy hover:opacity-90">
              <Send className="size-4" />
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
