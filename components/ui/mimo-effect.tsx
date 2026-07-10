'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { LilioRosaIcon } from '@/components/ui/lirio-rosa-icon'

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export interface MimoPayload {
  /** ID único do evento (usado como React key e para remoção) */
  id: string
  /** Nome exibido de quem enviou o mimo */
  senderName: string
  /** Valor do mimo em USD */
  amountUSD: number
  /** Mensagem opcional do remetente */
  message?: string
}

interface MimoEffectProps {
  /**
   * Lista ativa de mimos — alimentada por WebSocket/WebRTC em produção
   * ou por estado local para simulação em desenvolvimento.
   */
  activeMimos: MimoPayload[]
  /** Callback para remover o mimo do estado externo após a animação (4.5 s) */
  onRemoveMimo: (id: string) => void
}

// ─── Constantes ───────────────────────────────────────────────────────────────

/** Duração total da animação em ms — deve ser igual à definida em globals.css */
const ANIMATION_DURATION_MS = 4500

/** Tenta carregar a imagem do Lírio Rosa; usa o SVG do design system como fallback */
const LIRIO_PNG = '/assets/lirio-rosa.png'

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Overlay de Mimos em tempo real.
 *
 * Renderiza cards flutuantes animados com o ícone do Lírio Rosa, nome do
 * remetente e valor em USD. Cada card sobe e desaparece em 4.5 s.
 *
 * A animação `floatUp` está definida em `app/globals.css` para garantir
 * compatibilidade com Tailwind v4 (sem styled-jsx).
 *
 * @example
 * <MimoEffect activeMimos={mimos} onRemoveMimo={(id) => removeMimo(id)} />
 */
export function MimoEffect({ activeMimos, onRemoveMimo }: MimoEffectProps) {
  // Rastreia quais IDs falharam ao carregar a imagem PNG → usa SVG fallback
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  // ── Auto-remoção após animação ──────────────────────────────────────────────
  // Correção do bug original: retorno de cleanup dentro de forEach não funciona.
  // O correto é mapear todos os timers e limpar na função de cleanup do effect.
  useEffect(() => {
    const timers = activeMimos.map((mimo) =>
      window.setTimeout(() => onRemoveMimo(mimo.id), ANIMATION_DURATION_MS),
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
      {activeMimos.map((mimo, index) => {
        // Offset horizontal orgânico baseado no índice para evitar sobreposição
        const left = `${15 + ((index * 23) % 70)}%`

        return (
          <div
            key={mimo.id}
            style={{ left, bottom: '12%' }}
            className="animate-mimo-float absolute flex items-center gap-3 rounded-full border border-amber-500/40 bg-slate-950/85 px-4 py-2 shadow-[0_10px_25px_rgba(0,0,0,0.8)] backdrop-blur-md"
          >
            {/* ── Ícone do Lírio Rosa ─────────────────────────────────────── */}
            <div className="relative flex size-11 shrink-0 animate-pulse items-center justify-center">
              {!imageErrors[mimo.id] ? (
                <Image
                  src={LIRIO_PNG}
                  alt="Lírio Rosa — Mimo"
                  width={44}
                  height={44}
                  className="object-contain drop-shadow-[0_0_12px_rgba(244,114,182,0.8)]"
                  onError={() => handleImageError(mimo.id)}
                  priority
                />
              ) : (
                // Fallback: componente SVG do design system (sempre disponível)
                <LilioRosaIcon
                  size={40}
                  className="drop-shadow-[0_0_10px_rgba(244,114,182,0.6)]"
                />
              )}
            </div>

            {/* ── Dados da transação ──────────────────────────────────────── */}
            <div className="flex flex-col pr-2">
              {/* Remetente + badge "Mimo" */}
              <div className="flex items-center gap-2">
                <span className="max-w-[120px] truncate text-xs font-semibold text-slate-300">
                  {mimo.senderName}
                </span>
                <span className="rounded border border-rose-800/50 bg-rose-950/60 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-400">
                  Mimo
                </span>
              </div>

              {/* Valor em USD — destaque dourado */}
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

// ─── Hook auxiliar para gerenciar estado de mimos ─────────────────────────────

/**
 * Gerencia o estado da lista de mimos ativos.
 *
 * Em produção, substitua `addMimo` pela ingestão do WebSocket/WebRTC.
 *
 * @example
 * const { activeMimos, addMimo, removeMimo } = useMimoState()
 * // ao receber evento do WebSocket:
 * socket.on('mimo', (payload) => addMimo(payload))
 */
export function useMimoState() {
  const [activeMimos, setActiveMimos] = useState<MimoPayload[]>([])

  const addMimo = useCallback((payload: Omit<MimoPayload, 'id'>) => {
    const id = `mimo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setActiveMimos((prev) => [...prev, { ...payload, id }])
  }, [])

  const removeMimo = useCallback((id: string) => {
    setActiveMimos((prev) => prev.filter((m) => m.id !== id))
  }, [])

  return { activeMimos, addMimo, removeMimo }
}
