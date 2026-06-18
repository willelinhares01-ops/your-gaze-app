'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check, Crown, Radio } from 'lucide-react'
import { tiers, makers } from '@/lib/data'
import { useApp } from '@/components/app-context'
import { CheckoutModal } from '@/components/checkout-modal'
import { cn } from '@/lib/utils'

export function AssinaturasScreen() {
  const { isFiel } = useApp()
  const [makerSel, setMakerSel] = useState(makers[0])
  const [checkout, setCheckout] = useState<{ plan: string; price: string; maker: string } | null>(null)

  return (
    <div className="px-6 py-8">
      <header className="mx-auto mb-6 max-w-4xl text-center">
        <h2 className="font-heading text-3xl text-navy">Assinar um Maker</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A assinatura é individual de cada Maker. Ao assinar, você se torna{' '}
          <span className="font-medium text-gold">Fiel Espectador</span> no perfil dela.
        </p>
      </header>

      {/* Seleção do Maker que será assinado */}
      <div className="mx-auto mb-8 max-w-4xl">
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Escolha o Maker
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {makers.map((m) => {
            const active = m.id === makerSel.id
            return (
              <button
                key={m.id}
                onClick={() => setMakerSel(m)}
                className={cn(
                  'flex items-center gap-2 rounded-full border bg-card py-1.5 pl-1.5 pr-4 transition-colors',
                  active ? 'border-gold shadow-sm' : 'border-border hover:border-gold/50',
                )}
              >
                <span className="relative size-8 overflow-hidden rounded-full">
                  <Image src={m.avatar} alt={m.name} fill sizes="32px" className="object-cover" />
                </span>
                <span className={cn('text-sm', active ? 'font-semibold text-navy' : 'text-navy/70')}>
                  {m.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-3">
        {tiers.map((t, i) => {
          const featured = i === 1
          return (
            <div
              key={t.name}
              className={cn(
                'flex flex-col rounded-2xl border bg-card p-6',
                featured ? 'border-gold shadow-md' : 'border-border',
              )}
            >
              <div className="mb-4 flex items-center gap-2">
                <Crown className={cn('size-5', featured ? 'text-gold' : 'text-navy')} />
                <h3 className="font-heading text-xl text-navy">{t.name}</h3>
              </div>
              <p className="mb-4">
                <span className="font-heading text-3xl text-gold">{t.price}</span>
                <span className="text-sm text-muted-foreground"> /mês</span>
              </p>
              <ul className="mb-6 flex flex-col gap-2">
                {t.perks.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-navy">
                    <Check className="size-4 shrink-0 text-gold" />
                    {p}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setCheckout({ plan: t.name, price: t.price, maker: makerSel.name })}
                className={cn(
                  'mt-auto rounded-xl border-2 py-3 text-sm font-semibold transition-opacity hover:opacity-90',
                  featured
                    ? 'border-gold bg-gold text-navy'
                    : 'border-navy bg-navy text-gold',
                )}
              >
                {t.name}
              </button>
            </div>
          )
        })}
      </div>

      {/* Aviso: transmissão é bônus / venda avulsa */}
      <div className="mx-auto mt-8 flex max-w-4xl items-start gap-3 rounded-2xl border border-gold/40 bg-gold/5 p-5">
        <Radio className="mt-0.5 size-5 shrink-0 text-gold" />
        <p className="text-sm text-navy">
          <span className="font-semibold">Transmissões</span> podem vir como bônus da assinatura. Também são
          vendidas avulsas — por ingresso (quando há vários espectadores), por horas de PPV ou encomendadas
          especialmente, com valores de <span className="font-medium">US$ 50 a US$ 1.000</span>.
        </p>
      </div>

      {/* Painel de assinaturas ativas (Fiel Espectador) */}
      {isFiel && (
        <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 font-heading text-xl text-navy">Makers que você assina</h3>
          <ul className="divide-y divide-border">
            {makers.slice(0, 2).map((m) => (
              <li key={m.id} className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-navy">{m.name}</span>
                <span className="text-sm text-gold">Premium Gold · R$ 99/mês</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {checkout && (
        <CheckoutModal
          plan={checkout.plan}
          price={checkout.price}
          maker={checkout.maker}
          onClose={() => setCheckout(null)}
        />
      )}
    </div>
  )
}
