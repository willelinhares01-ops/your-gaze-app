import { cn } from '@/lib/utils'
import type { Maker, Viewer } from '@/lib/data'

// ─── Tipos públicos ────────────────────────────────────────────────────────────

/**
 * Variantes de anel disponíveis:
 *
 * - `none`          → avatar limpo, sem anel
 * - `founder`       → Maker Fundador (#1–#1.000): anel ouro canônico
 * - `fiel-monthly`  → Espectador Fiel do Mês: Ouro Rosa cravado com Diamantes Azuis
 * - `fiel-annual`   → Espectador Fiel VIP Anual (12 meses): Ouro Negro + Diamantes Azuis
 */
export type AvatarRingVariant = 'none' | 'founder' | 'fiel-monthly' | 'fiel-annual'

export type AvatarRingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// ─── Tabela de tamanhos ────────────────────────────────────────────────────────

const SIZE_MAP: Record<AvatarRingSize, {
  outer: number   // diâmetro total incluindo anel
  ring:  number   // espessura do anel
  gap:   number   // espaço entre anel e foto
}> = {
  xs: { outer: 32, ring: 2,   gap: 1.5 },
  sm: { outer: 42, ring: 2.5, gap: 1.5 },
  md: { outer: 54, ring: 3,   gap: 2   },
  lg: { outer: 82, ring: 4,   gap: 2.5 },
  xl: { outer: 104, ring: 5,  gap: 3   },
}

// ─── Gradientes de anel ────────────────────────────────────────────────────────

/*
 * Ouro Canônico — Maker Fundador
 * Gradiente cônico simulando ouro polido com reflexos.
 */
const GRAD_FOUNDER = `conic-gradient(
  from 0deg,
  #D4AF37 0%,
  #F8EEB4 18%,
  #C9A227 36%,
  #F5E6A0 50%,
  #B8962E 68%,
  #F8EEB4 82%,
  #D4AF37 100%
)`

/*
 * Ouro Rosa — Espectador Fiel Mensal
 * Gradiente cônico em tons de rose gold (#C87B85 → #F4C2C2).
 */
const GRAD_FIEL_MONTHLY = `conic-gradient(
  from 0deg,
  #C87B85 0%,
  #F4C2C2 20%,
  #E8A0A8 38%,
  #B76E79 55%,
  #F0B0BC 72%,
  #C87B85 88%,
  #F4C2C2 100%
)`

/*
 * Ouro Negro — Espectador VIP Anual
 * Gradiente cônico em preto/dark com reflexos dourados.
 */
const GRAD_FIEL_ANNUAL = `conic-gradient(
  from 0deg,
  #1C1C2E 0%,
  #D4AF37 18%,
  #2A2A4A 36%,
  #C9A227 52%,
  #1C1C2E 68%,
  #B8962E 82%,
  #2A2A4A 100%
)`

const RING_GRADIENTS: Record<Exclude<AvatarRingVariant, 'none'>, string> = {
  'founder':       GRAD_FOUNDER,
  'fiel-monthly':  GRAD_FIEL_MONTHLY,
  'fiel-annual':   GRAD_FIEL_ANNUAL,
}

// ─── Diamantes Azuis (SVG overlay) ────────────────────────────────────────────

/**
 * Renderiza 8 diamantes azuis equidistantes no centro da faixa do anel.
 * Exclusivo para as variantes fiel-monthly e fiel-annual.
 */
function BlueDiamonds({
  outer,
  ring,
}: {
  outer: number
  ring: number
}) {
  const cx     = outer / 2
  const cy     = outer / 2
  const radius = outer / 2 - ring / 2   // centro da faixa do anel
  const dotR   = Math.max(ring * 0.34, 1.2)
  const angles = [0, 45, 90, 135, 180, 225, 270, 315]

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={outer}
      height={outer}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="gem-blue" cx="35%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#93C5FD" />   {/* blue-300 */}
          <stop offset="100%" stopColor="#1D4ED8" />   {/* blue-700 */}
        </radialGradient>
      </defs>
      {angles.map((a) => {
        const rad = (a * Math.PI) / 180
        const x   = cx + radius * Math.cos(rad)
        const y   = cy + radius * Math.sin(rad)
        return (
          <circle
            key={a}
            cx={x}
            cy={y}
            r={dotR}
            fill="url(#gem-blue)"
          />
        )
      })}
    </svg>
  )
}

// ─── Badges textuais (top / bottom) ───────────────────────────────────────────

type BadgeConfig = { top: string; bottom: string; bottomClass: string }

const BADGE_CONFIG: Record<'fiel-monthly' | 'fiel-annual', BadgeConfig> = {
  'fiel-monthly': {
    top:         'Your Gaze',
    bottom:      'Fiel Espectador',
    bottomClass: 'bg-emerald-600 text-white',
  },
  'fiel-annual': {
    top:         'Your Gaze',
    bottom:      'Fiel VIP Espectador',
    bottomClass: 'bg-amber-500 text-slate-950',
  },
}

/** Badges só aparecem em avatares md+ (texto ilegível em tamanhos menores) */
function RingBadges({
  variant,
  size,
}: {
  variant: AvatarRingVariant
  size: AvatarRingSize
}) {
  if (variant === 'none' || variant === 'founder') return null
  if (size === 'xs' || size === 'sm') return null

  const cfg = BADGE_CONFIG[variant]

  return (
    <>
      {/* Badge superior — "Your Gaze" em vermelho */}
      <span className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[45%] whitespace-nowrap rounded-full bg-red-600 px-1.5 py-[2px] text-[7px] font-black uppercase tracking-wider text-white shadow">
        {cfg.top}
      </span>

      {/* Badge inferior — Fiel Espectador (verde) ou Fiel VIP Espectador (dourado) */}
      <span
        className={cn(
          'pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[45%] whitespace-nowrap rounded-full px-1.5 py-[2px] text-[7px] font-black uppercase tracking-wider shadow',
          cfg.bottomClass,
        )}
      >
        {cfg.bottom}
      </span>
    </>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────────

export type AvatarRingProps = {
  src: string
  alt: string
  /** Tamanho do avatar incluindo o anel. Default: 'md' */
  size?: AvatarRingSize
  /** Variante visual do anel. Default: 'none' */
  variant?: AvatarRingVariant
  className?: string
}

/**
 * Avatar com sistema de anéis de joia.
 *
 * @example
 * // Espectador Fiel do Mês
 * <AvatarRing src={user.avatar} alt={user.name} variant="fiel-monthly" size="lg" />
 *
 * // Maker Fundador
 * <AvatarRing src={maker.avatar} alt={maker.name} variant={resolveAvatarVariant({ isMaker: true, founderNumber: maker.founderNumber })} size="md" />
 */
export function AvatarRing({
  src,
  alt,
  size = 'md',
  variant = 'none',
  className,
}: AvatarRingProps) {
  const { outer, ring, gap } = SIZE_MAP[size]
  const insetPx = `${ring + gap}px`

  // Avatar limpo — sem anel
  if (variant === 'none') {
    return (
      <img
        src={src}
        alt={alt}
        width={outer}
        height={outer}
        className={cn('rounded-full object-cover', className)}
        style={{ width: outer, height: outer, flexShrink: 0 }}
      />
    )
  }

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: outer, height: outer }}
      title={alt}
    >
      {/* ── Anel (gradiente cônico) ──────────────────────────────────────── */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: RING_GRADIENTS[variant] }}
      />

      {/* ── Diamantes azuis (fiel-monthly e fiel-annual apenas) ─────────── */}
      {(variant === 'fiel-monthly' || variant === 'fiel-annual') && (
        <BlueDiamonds outer={outer} ring={ring} />
      )}

      {/* ── Gap branco entre anel e foto ─────────────────────────────────── */}
      <div
        className="absolute rounded-full bg-white"
        style={{ inset: insetPx }}
      />

      {/* ── Foto de perfil ───────────────────────────────────────────────── */}
      <img
        src={src}
        alt={alt}
        className="absolute rounded-full object-cover"
        style={{ inset: insetPx }}
      />

      {/* ── Selos textuais (md+) ─────────────────────────────────────────── */}
      <RingBadges variant={variant} size={size} />
    </div>
  )
}

// ─── Helper: resolver variante a partir dos dados do usuário ──────────────────

/**
 * Determina qual variante de anel renderizar com base nos dados do Maker ou Viewer.
 *
 * Regras de prioridade:
 * 1. Maker Fundador (founderNumber <= 1000) → 'founder'
 * 2. Espectador com recompensa anual        → 'fiel-annual'
 * 3. Espectador Fiel do Mês                 → 'fiel-monthly'
 * 4. Padrão                                 → 'none'
 */
export function resolveAvatarVariant(opts: {
  isMaker?: boolean
  founderNumber?: number
  isFielDoMes?: boolean
  unlockedAnualReward?: boolean
}): AvatarRingVariant {
  if (opts.isMaker && typeof opts.founderNumber === 'number' && opts.founderNumber <= 1000) {
    return 'founder'
  }
  if (opts.unlockedAnualReward) return 'fiel-annual'
  if (opts.isFielDoMes)        return 'fiel-monthly'
  return 'none'
}

// ─── Helpers de conveniência ──────────────────────────────────────────────────

/**
 * Retorna a variante de anel para um Maker dado, sem precisar inferir externamente.
 */
export function makerRingVariant(maker: Maker): AvatarRingVariant {
  return resolveAvatarVariant({ isMaker: true, founderNumber: maker.founderNumber })
}

/**
 * Retorna a variante de anel para um Viewer dado.
 */
export function viewerRingVariant(viewer: Viewer): AvatarRingVariant {
  return resolveAvatarVariant({
    isFielDoMes:          viewer.isFielDoMes,
    unlockedAnualReward:  viewer.unlockedAnualReward,
  })
}
