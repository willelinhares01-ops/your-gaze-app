'use client'

import { useEffect, useRef, useState, useId } from 'react'
import { ExternalLink, Sparkles } from 'lucide-react'

// ─── Tipos ─────────────────────────────────────────────────────────────────────

interface AdCreative {
  brand: string
  tagline: string
  cta: string
  /** Cor de destaque da marca (classe Tailwind safe-list ou hex inline) */
  accentColor: string
  href: string
  /** Gradiente CSS para o fundo do banner */
  bg: string
}

interface AdPlacementProps {
  /** Handle do Maker cuja vitrine exibe o anúncio (para atribuição de receita) */
  makerHandle: string
  /**
   * Índice da criativa a exibir. Rotaciona automaticamente entre as marcas
   * parceiras quando não especificado.
   */
  creativeIndex?: number
}

// ─── Criativas de marcas parceiras de luxo (mock de produção) ─────────────────

const AD_CREATIVES: AdCreative[] = [
  {
    brand:       'LUMIÈRE NOIR',
    tagline:     'Parfums de niche para quem existe além dos algoritmos.',
    cta:         'Descobrir a Coleção',
    accentColor: '#D4AF37',
    href:        '#',
    bg:          'linear-gradient(135deg, #0A0A18 0%, #1C1C2E 60%, #0F0F1A 100%)',
  },
  {
    brand:       'VELVET VAULT',
    tagline:     'Relógios Automáticos Independentes — Série Limitada 1/1.',
    cta:         'Ver Peças Únicas',
    accentColor: '#C0A97E',
    href:        '#',
    bg:          'linear-gradient(135deg, #0F0A00 0%, #1A1200 60%, #0A0800 100%)',
  },
  {
    brand:       'OBSIDIAN CARE',
    tagline:     'Skincare de alta performance para audiências soberanas.',
    cta:         'Conhecer o Ritual',
    accentColor: '#A8C4D0',
    href:        '#',
    bg:          'linear-gradient(135deg, #060A0F 0%, #0B1520 60%, #060A0F 100%)',
  },
]

// ─── Componente ────────────────────────────────────────────────────────────────

/**
 * AdPlacement — Motor de monetização passiva da vitrine pública do Maker.
 *
 * Funcionamento:
 * 1. Exibe um banner de marca parceira de luxo em formato paisagem.
 * 2. IntersectionObserver monitora 100% de visibilidade do elemento na viewport.
 * 3. Após 2 s ininterruptos visível, a impressão é registrada (viewability IAB).
 * 4. Um micro-efeito visual dourado confirma silenciosamente a monetização.
 * 5. Uma badge explica ao Espectador que 15% da receita vai ao Maker.
 */
export function AdPlacement({ makerHandle, creativeIndex }: AdPlacementProps) {
  const uid         = useId()
  const ref         = useRef<HTMLDivElement>(null)
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [viewable,    setViewable]    = useState(false)   // impressão válida registrada
  const [glowActive,  setGlowActive]  = useState(false)   // micro-efeito dourado

  // Seleciona criativa: por índice fixo ou pelo hash do handle (rotação estável por Maker)
  const idx = creativeIndex ?? (
    Math.abs(
      makerHandle.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    ) % AD_CREATIVES.length
  )
  const ad = AD_CREATIVES[idx]!

  // ── IntersectionObserver — detecta visibilidade de 100% por 2 s ──────────────
  useEffect(() => {
    const el = ref.current
    if (!el || viewable) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Elemento totalmente visível: inicia contador de 2 s
          timerRef.current = setTimeout(() => {
            setViewable(true)

            // Micro-efeito dourado de confirmação
            setGlowActive(true)
            setTimeout(() => setGlowActive(false), 1800)

            // Aqui se enviaria o evento de impressão para o Ads Engine
            console.info(
              `[AdEngine] Impressão válida registrada · maker=${makerHandle} · brand=${ad.brand} · ts=${new Date().toISOString()}`,
            )
          }, 2000)
        } else {
          // Saiu da viewport antes dos 2 s: cancela o contador
          if (timerRef.current) clearTimeout(timerRef.current)
        }
      },
      { threshold: 1.0 },   // 100% visível (padrão IAB viewability)
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [viewable, makerHandle, ad.brand])

  return (
    <section
      aria-label={`Publicidade parceira — ${ad.brand}`}
      className="mx-auto mt-8 max-w-5xl px-4"
    >
      {/* ── Badge informativa de transparência ── */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Publicidade
        </span>
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-[10px] text-slate-400">
          15% desta receita é repassada diretamente ao Maker
        </span>
      </div>

      {/* ── Banner principal ── */}
      <div
        ref={ref}
        id={`ad-${uid}`}
        className="relative overflow-hidden rounded-2xl border border-slate-800 shadow-lg transition-all duration-500"
        style={{ background: ad.bg }}
      >
        {/* Micro-efeito dourado de viewability confirmada */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-700 ${
            glowActive ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(212,175,55,0.18) 0%, transparent 70%)',
            boxShadow: glowActive
              ? '0 0 0 1px rgba(212,175,55,0.5), inset 0 0 40px rgba(212,175,55,0.08)'
              : 'none',
          }}
        />

        {/* Padrão decorativo geométrico */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(60deg, #D4AF37 0, #D4AF37 1px, transparent 0, transparent 50%)',
            backgroundSize: '22px 22px',
          }}
        />

        {/* Conteúdo do banner */}
        <div className="relative flex flex-col gap-4 px-7 py-6 sm:flex-row sm:items-center sm:gap-8">
          {/* Marca */}
          <div className="flex-1 min-w-0">
            <p
              className="font-serif text-xs font-black uppercase tracking-[0.3em]"
              style={{ color: ad.accentColor }}
            >
              {ad.brand}
            </p>
            <p className="mt-1.5 text-base font-semibold leading-snug text-white sm:text-lg">
              {ad.tagline}
            </p>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Indicador de impressão válida */}
            {viewable && (
              <div
                title="Impressão válida — receita atribuída ao Maker"
                className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold"
                style={{
                  borderColor: `${ad.accentColor}40`,
                  color: ad.accentColor,
                  background: `${ad.accentColor}10`,
                }}
              >
                <Sparkles className="size-3" />
                Ativo
              </div>
            )}

            <a
              href={ad.href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-slate-950 shadow-md transition-all hover:scale-[1.03] hover:shadow-lg active:scale-[.97]"
              style={{ background: ad.accentColor }}
            >
              {ad.cta}
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>

        {/* Rodapé: atribuição de receita */}
        <div
          className="border-t px-7 py-2 flex items-center justify-between"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <span className="text-[10px] text-slate-600">
            Anúncio patrocinado · Your Gaze Ads Engine
          </span>
          <span className="text-[10px] font-semibold" style={{ color: `${ad.accentColor}90` }}>
            Receita → {makerHandle}
          </span>
        </div>
      </div>
    </section>
  )
}
