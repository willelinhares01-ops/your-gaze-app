'use client'

import { useState } from 'react'
import {
  DollarSign,
  Images,
  Gamepad2,
  Video,
  Lock,
  HandCoins,
  Radio,
  BookOpen,
  Clock,
  MessageSquareHeart,
  Crown,
  Plus,
  Trash2,
} from 'lucide-react'

const field =
  'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-gold'
const label = 'mb-1.5 block text-xs font-medium text-muted-foreground'

/** Campo monetário reutilizável (USD). */
function PriceField({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div>
      <label className={label}>{titulo} (USD)</label>
      <div className="relative">
        <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input defaultValue={valor} className={field + ' pl-9'} type="number" min={0} />
      </div>
    </div>
  )
}

/** Card de uma categoria de precificação. */
function PriceCard({
  icon: Icon,
  titulo,
  children,
}: {
  icon: typeof DollarSign
  titulo: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 flex items-center gap-2 font-heading text-lg text-navy">
        <Icon className="size-5 text-gold" /> {titulo}
      </h3>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

type Edicao = { id: string; titulo: string; periodo: 'Semanal' | 'Mensal'; preco: number }

export function PrecificacaoScreen() {
  const [ppv, setPpv] = useState(50)
  const [edicoes, setEdicoes] = useState<Edicao[]>([
    { id: 'e1', titulo: 'Edição #12 — Bastidores', periodo: 'Mensal', preco: 25 },
  ])
  const [titulo, setTitulo] = useState('')
  const [periodo, setPeriodo] = useState<'Semanal' | 'Mensal'>('Mensal')
  const [preco, setPreco] = useState(20)

  const addEdicao = () => {
    if (!titulo.trim()) return
    setEdicoes((e) => [...e, { id: crypto.randomUUID(), titulo, periodo, preco }])
    setTitulo('')
    setPreco(20)
  }

  return (
    <div className="px-6 py-8">
      <header className="mb-6">
        <h2 className="font-heading text-2xl text-navy">Precificação</h2>
        <p className="text-sm text-muted-foreground">
          Você dita as regras: assinaturas, mídias avulsas, PPV, gorjetas, lives, revistas e muito mais.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <PriceCard icon={Crown} titulo="Planos de Assinatura">
          {['Premium', 'Premium Gold', 'Premium Diamond'].map((p, i) => (
            <PriceField key={p} titulo={`${p} (USD/mês)`} valor={[9, 19, 39][i]} />
          ))}
        </PriceCard>

        <PriceCard icon={MessageSquareHeart} titulo="Combos de Mensagens">
          {['10 mensagens', '50 mensagens', '100 mensagens'].map((c, i) => (
            <PriceField key={c} titulo={c} valor={[15, 60, 100][i]} />
          ))}
        </PriceCard>

        <PriceCard icon={Images} titulo="Combos de Fotos / Fotos avulsas">
          <PriceField titulo="Foto avulsa" valor={5} />
          <PriceField titulo="Combo 10 fotos" valor={35} />
          <PriceField titulo="Combo 30 fotos" valor={80} />
        </PriceCard>

        <PriceCard icon={Video} titulo="Vídeos avulsos">
          <PriceField titulo="Vídeo curto (até 1 min)" valor={12} />
          <PriceField titulo="Vídeo longo (5+ min)" valor={40} />
        </PriceCard>

        <PriceCard icon={Gamepad2} titulo="Games avulsos">
          <PriceField titulo="Game / desafio interativo" valor={18} />
        </PriceCard>

        <PriceCard icon={HandCoins} titulo="Gorjetas (Tips)">
          <PriceField titulo="Gorjeta mínima" valor={3} />
          <PriceField titulo="Gorjeta sugerida" valor={20} />
        </PriceCard>

        <PriceCard icon={Radio} titulo="Lives pagas">
          <PriceField titulo="Ingresso de Live" valor={30} />
          <PriceField titulo="Live privada (por hora)" valor={150} />
        </PriceCard>

        <PriceCard icon={Clock} titulo="Compra de tempo de vídeo">
          <PriceField titulo="Por minuto adicional" valor={4} />
          <PriceField titulo="Pacote 15 min" valor={45} />
        </PriceCard>

        <PriceCard icon={MessageSquareHeart} titulo="Mensagens personalizadas">
          <PriceField titulo="Mensagem em vídeo dedicada" valor={50} />
          <PriceField titulo="Áudio personalizado" valor={20} />
        </PriceCard>

        <PriceCard icon={Lock} titulo="Conteúdo PPV (Pay-per-view)">
          <p className="text-xs text-muted-foreground">Defina o valor entre US$ 3,00 e US$ 1.000,00.</p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={3}
              max={1000}
              value={ppv}
              onChange={(e) => setPpv(Number(e.target.value))}
              className="flex-1 accent-[#D4AF37]"
            />
            <span className="w-28 rounded-lg bg-navy px-3 py-2 text-center text-sm font-semibold text-primary-foreground">
              US$ {ppv.toFixed(2)}
            </span>
          </div>
        </PriceCard>
      </div>

      {/* Revista Digital — editor próprio na plataforma */}
      <div className="mt-6 rounded-2xl border border-gold/50 bg-gold/5 p-6">
        <h3 className="mb-1 flex items-center gap-2 font-heading text-lg text-navy">
          <BookOpen className="size-5 text-gold" /> Revista Digital
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Produza e edite sua revista (semanal ou mensal) aqui na plataforma e defina o preço de cada edição.
        </p>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
          <div>
            <label className={label}>Título da edição</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Edição #13 — Verão"
              className={field}
            />
          </div>
          <div>
            <label className={label}>Periodicidade</label>
            <select value={periodo} onChange={(e) => setPeriodo(e.target.value as 'Semanal' | 'Mensal')} className={field}>
              <option value="Semanal">Semanal</option>
              <option value="Mensal">Mensal</option>
            </select>
          </div>
          <div>
            <label className={label}>Preço (USD)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={preco}
                onChange={(e) => setPreco(Number(e.target.value))}
                type="number"
                min={0}
                className={field + ' w-28 pl-9'}
              />
            </div>
          </div>
          <button
            onClick={addEdicao}
            className="flex items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus className="size-4" /> Criar edição
          </button>
        </div>

        {edicoes.length > 0 && (
          <ul className="mt-5 divide-y divide-gold/20 border-t border-gold/20">
            {edicoes.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-navy">{e.titulo}</p>
                  <p className="text-xs text-muted-foreground">{e.periodo} · US$ {e.preco.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-navy hover:border-gold">
                    Editar / Produzir
                  </button>
                  <button
                    onClick={() => setEdicoes((list) => list.filter((x) => x.id !== e.id))}
                    title="Remover edição"
                    className="rounded-md border border-border p-1.5 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
