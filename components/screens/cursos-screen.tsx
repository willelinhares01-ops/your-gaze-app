'use client'

import { useState } from 'react'
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Check,
  Lock,
  ShieldCheck,
  Zap,
  Globe,
  TrendingUp,
  Star,
  Clock,
} from 'lucide-react'
import { makers } from '@/lib/data'
import { CheckoutModal } from '@/components/checkout-modal'
import { cn } from '@/lib/utils'

// ─── Dados do curso ────────────────────────────────────────────────────────────

type Chapter = { title: string; locked?: boolean }
type Module  = { id: string; number: string; title: string; chapters: Chapter[] }

const COURSE = {
  title:    'THE SOVEREIGN CREATOR',
  subtitle: 'O Manual do Criador de Alta Renda',
  price:    'USD $97.00',
  priceNote:'Acesso vitalício · Pagamento único',
  totalModules:  4,
  totalChapters: 9,
  totalHours:    '12h+',
  currency: 'USD $97.00',
  guaranteeDays: 7,
  modules: [
    {
      id: 'm1',
      number: 'MÓDULO 1',
      title: 'A Psicologia da Escassez e a Venda Direta (PPV)',
      chapters: [
        { title: '1.1  O Fim da Dependência de Algoritmos e Anúncios de Baixo CPM.' },
        { title: '1.2  A Engenharia do Teaser: Como usar o desfoque estratégico (Blur) para converter curiosos em compradores.', locked: true },
        { title: '1.3  Copywriting de Direct Message: Roteiros de conversação para tickets de US$ 9,90 a US$ 499,00.', locked: true },
      ],
    },
    {
      id: 'm2',
      number: 'MÓDULO 2',
      title: 'Gamificação e Competição por Ego (Leilões 1/1)',
      chapters: [
        { title: '2.1  A Economia da Exclusividade: Por que uma peça única vale 100x mais que a distribuição em massa.' },
        { title: '2.2  Cronômetros de Escassez: Dinâmica de lances e ancoragem de preços elevados.', locked: true },
        { title: '2.3  Entrega e Certificação Digital de Peças Únicas no Ecossistema Your Gaze.', locked: true },
      ],
    },
    {
      id: 'm3',
      number: 'MÓDULO 3',
      title: 'Retenção e Assinaturas Recorrentes (Fiel Espectador)',
      chapters: [
        { title: '3.1  Como desenhar a escada de valor perfeita: Degustação ➔ Premium ➔ Gold ➔ Diamond.' },
        { title: '3.2  Gestão de Comunidades VIP e Suporte Prioritário 1:1 de Alto Valor.', locked: true },
      ],
    },
    {
      id: 'm4',
      number: 'MÓDULO 4',
      title: 'Domínio Global (Precificação em Dólar e Multi-Moeda)',
      chapters: [
        { title: '4.1  Por que cobrar em USD ($) é o único caminho para blindagem patrimonial contra inflação local.' },
        { title: '4.2  Atração de tráfego internacional (EUA e Europa) para criadores da América Latina.', locked: true },
      ],
    },
  ] as Module[],
}

const HIGHLIGHTS = [
  { icon: Zap,        text: 'Receita independente de algoritmos' },
  { icon: TrendingUp, text: 'Tickets de US$ 9,90 até US$ 1.000' },
  { icon: Globe,      text: 'Domínio global em dólar' },
  { icon: Star,       text: 'Sistema de exclusividade 1:1' },
]

// ─── Componente de Módulo (acordeão) ─────────────────────────────────────────

function ModuleAccordion({ mod, index }: { mod: Module; index: number }) {
  const [open, setOpen] = useState(index === 0)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/60"
      >
        <div className="flex items-center gap-4">
          {/* Número do módulo */}
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-navy text-[10px] font-black uppercase tracking-widest text-gold">
            M{index + 1}
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {mod.number}
            </p>
            <p className="text-sm font-bold text-navy leading-snug">{mod.title}</p>
          </div>
        </div>
        <span className="shrink-0 text-muted-foreground">
          {open
            ? <ChevronUp  className="size-4" />
            : <ChevronDown className="size-4" />
          }
        </span>
      </button>

      {open && (
        <ul className="divide-y divide-border border-t border-border">
          {mod.chapters.map((ch) => (
            <li
              key={ch.title}
              className="flex items-start gap-3 px-5 py-3.5"
            >
              {ch.locked ? (
                <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" strokeWidth={1.75} />
              ) : (
                <BookOpen className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.75} />
              )}
              <span className={cn('text-sm leading-snug', ch.locked ? 'text-muted-foreground/70' : 'text-navy')}>
                {ch.title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Tela Principal ───────────────────────────────────────────────────────────

export function CursosScreen() {
  const [checkout, setCheckout] = useState(false)

  const openCheckout = () => setCheckout(true)

  return (
    <div className="pb-16">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-navy px-6 py-14 text-center">
        {/* Halo decorativo */}
        <div className="pointer-events-none absolute left-1/2 top-0 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-3xl" />

        <p className="relative mb-2 text-xs font-bold uppercase tracking-[0.25em] text-gold/80">
          Your Gaze · Infoproduto Exclusivo
        </p>
        <h1 className="relative font-heading text-4xl font-black uppercase tracking-tight text-primary-foreground sm:text-5xl">
          {COURSE.title}
        </h1>
        <p className="relative mt-2 font-heading text-lg text-gold/90 italic">
          {COURSE.subtitle}
        </p>

        {/* Meta-dados rápidos */}
        <div className="relative mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-primary-foreground/70">
          {[
            { icon: BookOpen, label: `${COURSE.totalModules} módulos`       },
            { icon: Check,    label: `${COURSE.totalChapters} capítulos`    },
            { icon: Clock,    label: `${COURSE.totalHours} de conteúdo`     },
            { icon: Globe,    label: 'Acesso vitalício'                      },
          ].map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-1.5">
              <Icon className="size-3.5 text-gold" strokeWidth={1.75} />
              {label}
            </span>
          ))}
        </div>

        {/* CTA Hero */}
        <div className="relative mt-8 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={openCheckout}
            className="rounded-2xl bg-gradient-to-r from-gold/80 to-gold px-10 py-4 font-bold text-navy shadow-xl transition-all hover:shadow-gold/30 hover:opacity-95 active:scale-[.98]"
          >
            QUERO ACESSO AGORA · {COURSE.price}
          </button>
          <p className="text-[11px] text-primary-foreground/50">{COURSE.priceNote}</p>
        </div>
      </div>

      {/* ── Destaques ── */}
      <div className="border-b border-border bg-secondary/40 px-6 py-5">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {HIGHLIGHTS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex flex-col items-center gap-1.5 text-center">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gold/15">
                <Icon className="size-4 text-gold" strokeWidth={1.75} />
              </span>
              <p className="text-[11px] font-semibold leading-tight text-navy">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Conteúdo principal ── */}
      <div className="mx-auto max-w-3xl space-y-8 px-6 pt-8">

        {/* O que você vai aprender */}
        <div>
          <h2 className="mb-4 font-heading text-2xl font-bold text-navy">
            O que você vai aprender
          </h2>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {[
              'Criar renda recorrente sem depender de redes sociais',
              'Vender conteúdo direto ao fã com tickets de US$ 9,90 a US$ 499',
              'Montar leilões de exclusividade que geram competição pelo seu conteúdo',
              'Precificar em dólar e receber de qualquer país do mundo',
              'Converter seguidores gratuitos em assinantes Diamond',
              'Gerenciar comunidades VIP com atendimento 1:1 de alto valor',
              'Usar desfoque estratégico (blur) para maximizar conversão em PPV',
              'Construir blindagem patrimonial contra inflação via câmbio',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={2.5} />
                <p className="text-sm text-navy">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Módulos */}
        <div>
          <h2 className="mb-4 font-heading text-2xl font-bold text-navy">
            Conteúdo do Curso
          </h2>
          <div className="space-y-3">
            {COURSE.modules.map((mod, i) => (
              <ModuleAccordion key={mod.id} mod={mod} index={i} />
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3.5" strokeWidth={1.75} />
            Capítulos com cadeado são liberados após a compra.
          </p>
        </div>

        {/* Quem é o Instrutor */}
        <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-full border-2 border-gold">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={makers[0].avatar}
              alt={makers[0].name}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Criador(a) do curso
            </p>
            <p className="mt-0.5 font-heading text-lg font-bold text-navy">{makers[0].name}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Criadora de conteúdo premium com mais de 1.200 assinantes ativos, especialista em monetização
              direta e estratégia de exclusividade no Your Gaze.
            </p>
          </div>
        </div>

        {/* Garantia */}
        <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <ShieldCheck className="size-10 shrink-0 text-emerald-500" strokeWidth={1.5} />
          <div>
            <p className="font-bold text-emerald-800">
              Garantia de {COURSE.guaranteeDays} dias sem risco
            </p>
            <p className="text-sm text-emerald-700">
              Se não ficar satisfeito, devolvemos 100% do valor. Sem burocracia, sem perguntas.
            </p>
          </div>
        </div>

        {/* CTA final */}
        <div className="rounded-2xl border border-gold/40 bg-gold/5 p-6 text-center">
          <p className="font-heading text-xl font-bold text-navy">
            Pronto para se tornar um Criador Soberano?
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Acesso vitalício · Todos os módulos · Atualizações incluídas
          </p>
          <button
            type="button"
            onClick={openCheckout}
            className="mt-5 w-full rounded-2xl bg-gradient-to-r from-gold/80 to-gold py-4 font-extrabold text-navy shadow-md transition-all hover:opacity-90 active:scale-[.98] sm:w-auto sm:px-14"
          >
            GARANTIR ACESSO · {COURSE.price}
          </button>
          <p className="mt-2 text-xs text-muted-foreground">
            {COURSE.priceNote}
          </p>
        </div>
      </div>

      {/* ── Modal de Checkout ── */}
      {checkout && (
        <CheckoutModal
          plan={COURSE.title}
          price={COURSE.price}
          maker={makers[0].name}
          makerId={makers[0].id}
          makerAvatar={makers[0].avatar}
          onClose={() => setCheckout(false)}
        />
      )}
    </div>
  )
}
