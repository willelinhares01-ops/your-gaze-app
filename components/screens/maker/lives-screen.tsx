'use client'

import { useState, useEffect, useCallback } from 'react'
import { Radio, Trophy, Timer, Sparkles, Users, Zap } from 'lucide-react'
import { useDict } from '@/lib/locale-context'
import { LilioRosaIcon } from '@/components/ui/lirio-rosa-icon'
import { AvatarRing } from '@/components/ui/avatar-ring'
import { MimoEffect, type MimoPayload } from '@/components/maker-studio/MimoEffect'
import { makers } from '@/lib/data'

// ─── Conta oficial da sala de transmissão ─────────────────────────────────────

const OFFICIAL_MAKER = makers.find((m) => m.id === 'maker-0001') ?? makers[0]!

// ─── Valores rápidos de Mimo ──────────────────────────────────────────────────

const QUICK_AMOUNTS = [5, 15, 50] as const

// ─── Mock de Espectadores (simulação automática durante a live) ───────────────

const MOCK_SENDERS = [
  { name: 'Lucas R.',    message: 'Incrível! 🔥'              },
  { name: 'Ana Paula',   message: undefined                    },
  { name: 'Thiago M.',   message: 'Você é demais! 💛'         },
  { name: 'Fernanda S.', message: 'Obrigada pela live ✨'      },
  { name: 'Rafael K.',   message: undefined                    },
]
const MOCK_AUTO_AMOUNTS = [5, 10, 25, 50, 100]

// ─── Tipo de meta de Desejo ───────────────────────────────────────────────────

type Desejo = { nome: string; meta: number; atual: number }

const INITIAL_DESEJOS: Desejo[] = [
  { nome: 'Desejo 1', meta: 100, atual: 64  },
  { nome: 'Desejo 2', meta: 300, atual: 180 },
  { nome: 'Desejo 3', meta: 600, atual: 220 },
]

// ─── Helper: ID único para mimos ──────────────────────────────────────────────

function makeMimoId() {
  return `mimo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ─── Componente: Cabeçalho da Sala Oficial ────────────────────────────────────

function LiveRoomHeader({
  live,
  mm,
  ss,
  viewers,
  onToggle,
}: {
  live: boolean
  mm: string
  ss: string
  viewers: number
  onToggle: () => void
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${
        live
          ? 'border-rose-500/40 bg-rose-950/20 shadow-lg shadow-rose-500/10'
          : 'border-border bg-card'
      }`}
    >
      {/* Halo decorativo quando live */}
      {live && (
        <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-rose-500/10 blur-3xl" aria-hidden="true" />
      )}

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Identidade da sala */}
        <div className="flex items-center gap-4">
          <AvatarRing
            src={OFFICIAL_MAKER.avatar}
            alt={OFFICIAL_MAKER.name}
            size="md"
            variant="founder"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-base font-bold text-navy">
                {OFFICIAL_MAKER.name}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {OFFICIAL_MAKER.handle}
              </span>
            </div>

            {live ? (
              <div className="mt-1 flex items-center gap-3">
                {/* Badge AO VIVO */}
                <span className="flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-rose-500">
                  <span className="size-1.5 animate-pulse rounded-full bg-rose-500" />
                  Ao Vivo
                </span>
                {/* Contador de tempo */}
                <span className="flex items-center gap-1 rounded-md bg-navy/10 px-2 py-0.5 font-mono text-xs font-semibold text-navy">
                  <Timer className="size-3" /> {mm}:{ss}
                </span>
                {/* Espectadores */}
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="size-3" /> {viewers.toLocaleString('pt-BR')}
                </span>
              </div>
            ) : (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {OFFICIAL_MAKER.bio ?? 'Conta Oficial do Ecossistema Your Gaze.'}
              </p>
            )}
          </div>
        </div>

        {/* Controle da live */}
        <button
          type="button"
          onClick={onToggle}
          className={`flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
            live
              ? 'bg-destructive text-primary-foreground hover:opacity-90'
              : 'bg-gold text-navy hover:opacity-90'
          }`}
        >
          <Radio className="size-4" />
          {live ? 'Encerrar Live' : 'Iniciar Live'}
        </button>
      </div>
    </div>
  )
}

// ─── Componente: Barra rápida de envio de Mimos ───────────────────────────────

function QuickMimoBar({ onSend, disabled }: { onSend: (amount: number) => void; disabled: boolean }) {
  return (
    <div className="rounded-2xl border border-amber-200/40 bg-amber-50/40 p-4">
      <div className="mb-3 flex items-center gap-2">
        <LilioRosaIcon size={16} />
        <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
          Enviar Mimo — Sandbox (Espectador)
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {QUICK_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            disabled={disabled}
            onClick={() => onSend(amount)}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-amber-300/50 bg-white px-4 py-3 shadow-sm transition-all hover:border-amber-400 hover:bg-amber-50 hover:shadow-md active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <LilioRosaIcon size={20} />
            <span className="text-sm font-extrabold text-navy">
              USD&nbsp;${amount}
            </span>
          </button>
        ))}
      </div>

      {disabled && (
        <p className="mt-3 text-center text-[10px] text-amber-600/70">
          Inicie a Live para habilitar o envio de Mimos.
        </p>
      )}
    </div>
  )
}

// ─── Componente: Cards de Desejos com gamificação ────────────────────────────

function DesejoCards({ desejos }: { desejos: Desejo[] }) {
  const t = useDict()

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {desejos.map((d) => {
        const pct = Math.min((d.atual / d.meta) * 100, 100)
        const done = pct >= 100

        return (
          <div
            key={d.nome}
            className={`rounded-xl border p-4 transition-all ${
              done ? 'border-emerald-300/50 bg-emerald-50/50' : 'border-border'
            }`}
          >
            {/* Nome do desejo */}
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <LilioRosaIcon size={14} />
                <p className="text-sm font-semibold text-navy">{d.nome}</p>
              </div>
              {done && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                  META ✓
                </span>
              )}
            </div>

            {/* Progresso em USD */}
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-bold text-navy">
                USD&nbsp;${d.atual.toFixed(0)}
              </span>
              <span className="text-muted-foreground">
                {t.maker_studio.lives_meta} USD&nbsp;${d.meta}
              </span>
            </div>

            {/* Barra de progresso */}
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  done ? 'bg-emerald-500' : 'bg-gold'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <p className="mt-1 text-right text-[10px] text-muted-foreground">
              {pct.toFixed(0)}% atingido
            </p>
          </div>
        )
      })}
    </div>
  )
}

// ─── LivesScreen — Simulação E2E @YourGazeHub ────────────────────────────────

export function LivesScreen() {
  const t = useDict()

  const [live, setLive]       = useState(false)
  const [seconds, setSeconds] = useState(180)
  const [viewers, setViewers] = useState(312)

  // Estado central de mimos — alimentado por ações do Espectador Sandbox ou automação
  const [activeMimos, setActiveMimos] = useState<MimoPayload[]>([])

  // Estado das metas de Desejos — mutable para refletir o progresso real
  const [desejos, setDesejos] = useState<Desejo[]>(INITIAL_DESEJOS)

  // ── Cronômetro da live ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!live) return
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [live])

  // ── Simulação de Espectadores crescendo durante a live ────────────────────
  useEffect(() => {
    if (!live) return
    const id = setInterval(() => {
      setViewers((v) => v + Math.floor(Math.random() * 5))
    }, 4000)
    return () => clearInterval(id)
  }, [live])

  // ── Simulação automática: mimos de Espectadores reais a cada 6 s ──────────
  useEffect(() => {
    if (!live) return
    const id = setInterval(() => {
      const sender = MOCK_SENDERS[Math.floor(Math.random() * MOCK_SENDERS.length)]!
      const amount = MOCK_AUTO_AMOUNTS[Math.floor(Math.random() * MOCK_AUTO_AMOUNTS.length)]!
      addMimo(sender.name, amount, sender.message)
    }, 6000)
    return () => clearInterval(id)
  }, [live]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Removedor de mimo após animação ───────────────────────────────────────
  const handleRemoveMimo = useCallback((id: string) => {
    setActiveMimos((prev) => prev.filter((m) => m.id !== id))
  }, [])

  // ── Adiciona mimo ao estado + incrementa o primeiro desejo incompleto ──────
  function addMimo(senderName: string, amountUSD: number, message?: string) {
    const payload: MimoPayload = {
      id: makeMimoId(),
      senderName,
      amountUSD,
      message,
    }
    setActiveMimos((prev) => [...prev, payload])

    // Incrementa o primeiro desejo que ainda não atingiu a meta
    setDesejos((prev) => {
      let applied = false
      return prev.map((d) => {
        if (!applied && d.atual < d.meta) {
          applied = true
          return { ...d, atual: Math.min(d.atual + amountUSD, d.meta) }
        }
        return d
      })
    })
  }

  // ── Envio rápido pelo Espectador Sandbox ──────────────────────────────────
  function handleQuickSend(amount: number) {
    addMimo('Espectador Sandbox', amount)
  }

  // ── Toggle da live ─────────────────────────────────────────────────────────
  function handleToggleLive() {
    if (!live) {
      setSeconds(180)
      setViewers(312)
    }
    setLive((v) => !v)
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <>
      {/* ── Overlay de Mimos (fixed — fora do fluxo de layout) ─────────── */}
      <MimoEffect activeMimos={activeMimos} onRemoveMimo={handleRemoveMimo} />

      <div className="flex flex-col gap-5 px-6 py-8">

        {/* ── 1. Cabeçalho da Sala Oficial ─────────────────────────────── */}
        <LiveRoomHeader
          live={live}
          mm={mm}
          ss={ss}
          viewers={viewers}
          onToggle={handleToggleLive}
        />

        {/* ── 2. Aviso aguardando mimos (durante live sem nenhum ativo) ─── */}
        {live && activeMimos.length === 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5">
            <LilioRosaIcon size={16} />
            <p className="text-xs font-medium text-rose-700">
              Aguardando Mimos dos Espectadores… Um novo Mimo aparecerá em breve.
            </p>
          </div>
        )}

        {/* ── 3. Painel de Desejos (Gamificação) ───────────────────────── */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-heading text-lg text-navy">
              <Trophy className="size-5 text-gold" />
              {t.maker_studio.lives_leilao}
            </h3>
            {live && (
              <span className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-sm font-semibold text-gold">
                <Timer className="size-4" /> {mm}:{ss}
              </span>
            )}
          </div>

          <p className="mb-5 text-xs text-muted-foreground">
            {t.maker_studio.lives_desc}
          </p>

          <DesejoCards desejos={desejos} />

          {/* Nota institucional */}
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200/50 bg-amber-50/50 px-4 py-3">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
            <p className="text-[11px] leading-relaxed text-amber-800/80">
              Mimos enviados durante a Live são processados em{' '}
              <strong>USD&nbsp;($)</strong> com repasse líquido de{' '}
              <strong>85%</strong> ao Maker. A comissão do programa MGM Fundadores é
              deduzida da fatia de 15% da plataforma.
            </p>
          </div>
        </div>

        {/* ── 4. Barra de Ação Rápida de Mimos ─────────────────────────── */}
        <QuickMimoBar onSend={handleQuickSend} disabled={!live} />

        {/* ── 5. Status E2E — somente em dev ───────────────────────────── */}
        {process.env.NODE_ENV === 'development' && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Zap className="size-3" /> Sandbox E2E — @YourGazeHub
            </p>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500">
              <span>Mimos ativos: <strong className="text-slate-700">{activeMimos.length}</strong></span>
              <span>Espectadores: <strong className="text-slate-700">{viewers.toLocaleString('pt-BR')}</strong></span>
              <span>founderNumber: <strong className="text-slate-700">
                {OFFICIAL_MAKER.founderNumber ?? '—'}
              </strong></span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
