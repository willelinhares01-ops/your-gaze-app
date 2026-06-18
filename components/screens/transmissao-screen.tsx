'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play, Ticket, Timer, Users, User, Radio, Gift, Check } from 'lucide-react'
import { makers } from '@/lib/data'
import { useApp } from '@/components/app-context'
import { CheckoutModal } from '@/components/checkout-modal'

type Oferta = {
  id: string
  titulo: string
  descricao: string
  preco: string
  icon: typeof Ticket
  badge?: string
  destaque?: boolean
}

// Lives públicas com vários espectadores — acesso por ingresso.
const ingressos = [
  {
    id: 'l1',
    maker: makers[0],
    title: 'Live coletiva da semana',
    lotacao: 'Vários espectadores',
    preco: 'US$ 50',
  },
  {
    id: 'l2',
    maker: makers[2],
    title: 'Show especial — encomenda',
    lotacao: 'Ingresso avulso',
    preco: 'US$ 120',
  },
  {
    id: 'l3',
    maker: makers[3],
    title: 'Bastidores ao vivo',
    lotacao: 'Vários espectadores',
    preco: 'US$ 80',
  },
]

// Compra de tempo / formatos de live.
const formatos: Oferta[] = [
  {
    id: 'f1',
    titulo: 'Comprar tempo (PPV)',
    descricao: 'Carregue minutos e use para assistir lives ou parte delas até o tempo acabar.',
    preco: 'a partir de US$ 50',
    icon: Timer,
    badge: 'Por minuto',
    destaque: true,
  },
  {
    id: 'f2',
    titulo: 'Live individual (1:1)',
    descricao: 'Sessão privada só entre você e o Maker.',
    preco: 'a partir de US$ 200',
    icon: User,
  },
  {
    id: 'f3',
    titulo: 'Live em grupo (até 10)',
    descricao: 'Grupo fechado de no máximo 10 pessoas.',
    preco: 'a partir de US$ 100',
    icon: Users,
  },
  {
    id: 'f4',
    titulo: 'Game ao vivo',
    descricao: 'Participe de dinâmicas e games durante a transmissão.',
    preco: 'a partir de US$ 30',
    icon: Play,
  },
]

export function TransmissaoScreen() {
  const { isFiel } = useApp()
  const [checkout, setCheckout] = useState<{ plan: string; price: string } | null>(null)

  return (
    <div className="px-6 py-8">
      <header className="mx-auto mb-6 max-w-4xl">
        <h2 className="font-heading text-2xl text-navy">Transmissão</h2>
        <p className="text-sm text-muted-foreground">
          Acesso vendido por ingresso, tempo (PPV), games e lives individuais ou em grupo (até 10).
          Compre só o que quiser assistir.
        </p>
      </header>

      {/* Bônus para Fiel Espectador */}
      {isFiel && (
        <div className="mx-auto mb-8 flex max-w-4xl items-center gap-3 rounded-2xl border border-gold/40 bg-gold/10 p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold text-navy">
            <Gift className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-navy">Bônus de assinatura ativo</p>
            <p className="text-xs text-muted-foreground">
              Como Fiel Espectador, o Maker liberou para você as lives coletivas incluídas no seu plano.
            </p>
          </div>
        </div>
      )}

      {/* Formatos / compra de tempo */}
      <section className="mx-auto mb-10 max-w-4xl">
        <h3 className="mb-4 font-heading text-lg text-navy">Formatos disponíveis</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {formatos.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.id}
                className={`flex flex-col rounded-2xl border bg-card p-4 ${
                  f.destaque ? 'border-gold' : 'border-border'
                }`}
              >
                <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-cream text-gold">
                  <Icon className="size-5" />
                </span>
                <p className="text-sm font-semibold text-navy">{f.titulo}</p>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">
                  {f.descricao}
                </p>
                <p className="mt-3 text-sm font-semibold text-gold">{f.preco}</p>
                <button
                  onClick={() => setCheckout({ plan: f.titulo, price: f.preco })}
                  className="mt-3 rounded-xl bg-navy py-2.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Comprar
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* Ingressos de lives coletivas */}
      <section className="mx-auto max-w-4xl">
        <h3 className="mb-4 font-heading text-lg text-navy">Ingressos para lives</h3>
        <div className="grid gap-5 md:grid-cols-3">
          {ingressos.map((l) => (
            <div key={l.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="relative aspect-video">
                <Image src={l.maker.avatar} alt={l.maker.name} fill sizes="33vw" className="object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-navy/30">
                  <span className="flex size-12 items-center justify-center rounded-full bg-gold text-navy">
                    <Radio className="size-5" />
                  </span>
                </div>
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-navy/80 px-2 py-0.5 text-xs font-medium text-gold">
                  <Users className="size-3" /> {l.lotacao}
                </span>
              </div>
              <div className="flex flex-col gap-2 p-4">
                <div>
                  <p className="text-sm font-semibold text-navy">{l.maker.name}</p>
                  <p className="text-xs text-muted-foreground">{l.title}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gold">{l.preco}</span>
                  {isFiel ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-navy">
                      <Check className="size-3.5 text-gold" /> Incluído
                    </span>
                  ) : (
                    <button
                      onClick={() => setCheckout({ plan: `Ingresso · ${l.title}`, price: l.preco })}
                      className="flex items-center gap-1 rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-navy hover:opacity-90"
                    >
                      <Ticket className="size-3.5" /> Ingresso
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {checkout && (
        <CheckoutModal plan={checkout.plan} price={checkout.price} onClose={() => setCheckout(null)} />
      )}
    </div>
  )
}
