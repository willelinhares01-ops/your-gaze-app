import { cn } from '@/lib/utils'

type LilioRosaIconProps = {
  /** Largura/altura em px (quadrado). Default: 16 */
  size?: number
  className?: string
  'aria-hidden'?: boolean | 'true' | 'false'
}

/**
 * Ícone oficial de Mimos da plataforma Your Gaze.
 * Lírio rosa visto de cima: 6 pétalas radiais alternadas em rosa/carmim
 * com estame dourado central. Substitui o ícone genérico de gift/coração
 * em todos os contextos de Mimos (Chat, Lives, Feed, Leilões).
 *
 * Formatação de valor: sempre `USD $ {valor}` — use junto ao componente.
 */
export function LilioRosaIcon({
  size = 16,
  className,
  'aria-hidden': ariaHidden = true,
}: LilioRosaIconProps) {
  // Pétalas nas 6 posições de 60° (0 = 12h, sentido horário)
  const PETALS = [0, 60, 120, 180, 240, 300] as const

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden={ariaHidden}
      role="img"
    >
      {/* ── Pétalas externas (alternadas) ──────────────────────────────────── */}
      {PETALS.map((angle, i) => (
        <ellipse
          key={angle}
          cx="12"
          cy="5.5"
          rx="2.4"
          ry="5"
          fill={i % 2 === 0 ? '#F472B6' : '#FBCFE8'}   /* pink-400 / pink-200 */
          transform={`rotate(${angle}, 12, 12)`}
        />
      ))}

      {/* ── Pétalas internas — camada de profundidade ──────────────────────── */}
      {PETALS.map((angle, i) => (
        <ellipse
          key={`inner-${angle}`}
          cx="12"
          cy="7"
          rx="1.4"
          ry="3"
          fill={i % 2 === 0 ? '#EC4899' : '#F9A8D4'}   /* pink-500 / pink-300 */
          opacity={0.7}
          transform={`rotate(${angle + 30}, 12, 12)`}
        />
      ))}

      {/* ── Estame central — círculo âmbar ────────────────────────────────── */}
      <circle cx="12" cy="12" r="2.6" fill="#FCD34D" />   {/* yellow-300 */}
      <circle cx="12" cy="12" r="1.4" fill="#F59E0B" />   {/* amber-400  */}

      {/* ── Anteras (3 pontinhos ao redor do estame) ──────────────────────── */}
      {[90, 210, 330].map((a) => {
        const rad = (a * Math.PI) / 180
        return (
          <circle
            key={a}
            cx={12 + 2 * Math.cos(rad)}
            cy={12 + 2 * Math.sin(rad)}
            r={0.45}
            fill="#92400E"   /* amber-800 */
          />
        )
      })}
    </svg>
  )
}
