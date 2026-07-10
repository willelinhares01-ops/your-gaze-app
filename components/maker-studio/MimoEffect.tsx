'use client'

import { useEffect, useState, useCallback, useId } from 'react'
import Image from 'next/image'

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface MimoPayload {
  /** ID único do evento (chave React + identificador de remoção) */
  id: string
  /** Nome exibido de quem enviou o mimo */
  senderName: string
  /** Valor em USD */
  amountUSD: number
  /** Mensagem opcional do remetente */
  message?: string
}

interface MimoEffectProps {
  /** Lista ativa de mimos — alimentada por WebSocket/WebRTC em produção */
  activeMimos: MimoPayload[]
  /** Callback invocado após os 4.5 s de animação para limpar o estado externo */
  onRemoveMimo: (id: string) => void
}

// ─── Constantes ────────────────────────────────────────────────────────────────

const ANIMATION_MS = 4_500

/**
 * CSS encapsulado no próprio arquivo — garante portabilidade total do componente
 * e 60 FPS via `will-change: transform, opacity` (aceleração por hardware).
 *
 * Usa nome de keyframe isolado (`mimoFloatUp`) para não colidir com eventuais
 * regras globais. A classe `.mimo-float` é injetada uma única vez no DOM.
 */
const MIMO_CSS = `
@keyframes mimoFloatUp {
  0%   {
    opacity: 0;
    transform: translateY(80px)   scale(0.6) rotate(-8deg);
  }
  15%  {
    opacity: 1;
    transform: translateY(0px)    scale(1.05) rotate(4deg);
  }
  80%  {
    opacity: 1;
    transform: translateY(-220px) scale(1)    rotate(-3deg);
  }
  100% {
    opacity: 0;
    transform: translateY(-300px) scale(0.9)  rotate(6deg);
  }
}

.mimo-float {
  animation: mimoFloatUp 4.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  will-change: transform, opacity;
}
`

// ─── Fallback SVG (Lírio Rosa Sofisticado) ────────────────────────────────────

/**
 * Ícone vetorial de alta fidelidade usado quando o asset
 * `/assets/lirio-rosa.png` não está disponível.
 *
 * Os IDs dos gradientes são únicos por instância (via `useId`) para evitar
 * colisão de definições SVG quando múltiplos cards aparecem simultaneamente.
 */
function FallbackLilySVG() {
  // useId garante IDs únicos por instância — crítico quando vários cards estão visíveis
  const uid  = useId().replace(/:/g, '-')
  const gA   = `lily-grad-a-${uid}`
  const gB   = `lily-grad-b-${uid}`

  return (
    <svg
      className="size-10 drop-shadow-[0_0_10px_rgba(244,114,182,0.6)]"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Pétala principal — gradiente rosa profundo */}
      <path
        d="M32 58C32 58 30 38 12 28C26 26 30 14 32 6C34 14 38 26 52 28C34 38 32 58 32 58Z"
        fill={`url(#${gA})`}
      />
      {/* Pétala secundária — reflexo carmim */}
      <path
        d="M32 58C32 58 24 44 8 40C20 36 26 24 32 18C38 24 44 36 56 40C40 44 32 58 32 58Z"
        fill={`url(#${gB})`}
        opacity="0.8"
      />

      <defs>
        <linearGradient id={gA} x1="32" y1="6" x2="32" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F472B6" />
          <stop offset="0.6" stopColor="#EC4899" />
          <stop offset="1"   stopColor="#831843" />
        </linearGradient>
        <linearGradient id={gB} x1="8" y1="18" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBCFE8" />
          <stop offset="1" stopColor="#BE185D" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ─── MimoEffect ───────────────────────────────────────────────────────────────

/**
 * Overlay de Mimos em tempo real para Lives e Leilões.
 *
 * Renderiza cards flutuantes animados sobre `position: fixed; inset: 0; z-50`.
 * Cada card sobe e desaparece em 4.5 s via CSS `@keyframes mimoFloatUp`
 * injetado inline pelo próprio componente — sem dependência de globals.css.
 *
 * **Integração em produção**
 * ```tsx
 * // WebSocket ou WebRTC
 * socket.on('mimo', (payload: Omit<MimoPayload, 'id'>) => {
 *   const id = crypto.randomUUID()
 *   setActiveMimos((prev) => [...prev, { id, ...payload }])
 * })
 *
 * <MimoEffect activeMimos={activeMimos} onRemoveMimo={(id) =>
 *   setActiveMimos((prev) => prev.filter((m) => m.id !== id))
 * } />
 * ```
 */
export function MimoEffect({ activeMimos, onRemoveMimo }: MimoEffectProps) {
  // Rastreia falhas de carregamento do PNG por ID para acionar o SVG fallback
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  // ── Auto-remoção após o fim da animação ────────────────────────────────────
  // Mapeia todos os timers e limpa-os corretamente no cleanup do effect,
  // corrigindo o bug do `return` dentro de `forEach` que nunca executava.
  useEffect(() => {
    const timers = activeMimos.map((mimo) =>
      window.setTimeout(() => onRemoveMimo(mimo.id), ANIMATION_MS),
    )
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [activeMimos, onRemoveMimo])

  const handleImageError = useCallback((id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }))
  }, [])

  if (activeMimos.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
    >
      {/*
       * Keyframes injetados inline — encapsulados neste arquivo.
       * React deduplica <style> por conteúdo no App Router (React 19).
       * Em builds anteriores, múltiplos <style> com o mesmo conteúdo são inofensivos.
       */}
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: MIMO_CSS }} />

      {activeMimos.map((mimo, index) => {
        // Distribuição horizontal orgânica para evitar sobreposição de cards
        const left = `${15 + ((index * 23) % 70)}%`

        return (
          <div
            key={mimo.id}
            style={{ left, bottom: '12%' }}
            className="mimo-float absolute flex items-center gap-3 rounded-full border border-amber-500/40 bg-slate-950/85 px-4 py-2 shadow-[0_10px_25px_rgba(0,0,0,0.8)] backdrop-blur-md"
          >
            {/* ── Asset visual: PNG ou SVG vetorial fallback ─────────────── */}
            <div className="relative flex size-11 shrink-0 animate-pulse items-center justify-center">
              {!imageErrors[mimo.id] ? (
                <Image
                  src="/assets/lirio-rosa.png"
                  alt="Lírio Rosa — Mimo"
                  width={44}
                  height={44}
                  className="object-contain drop-shadow-[0_0_12px_rgba(244,114,182,0.8)]"
                  onError={() => handleImageError(mimo.id)}
                  priority
                />
              ) : (
                <FallbackLilySVG />
              )}
            </div>

            {/* ── Dados da transação ──────────────────────────────────────── */}
            <div className="flex flex-col pr-2">
              {/* Remetente + badge */}
              <div className="flex items-center gap-2">
                <span className="max-w-[120px] truncate text-xs font-semibold text-slate-300">
                  {mimo.senderName}
                </span>
                <span className="rounded border border-rose-800/50 bg-rose-950/60 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-400">
                  Mimo
                </span>
              </div>

              {/* Valor em USD — glow dourado */}
              <span className="mt-0.5 text-base font-extrabold tracking-tight text-amber-400 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]">
                USD&nbsp;${mimo.amountUSD.toFixed(2)}
              </span>

              {/* Mensagem opcional */}
              {mimo.message && (
                <p className="mt-0.5 max-w-[180px] truncate border-t border-slate-800/80 pt-0.5 text-[11px] italic text-slate-200">
                  &ldquo;{mimo.message}&rdquo;
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
