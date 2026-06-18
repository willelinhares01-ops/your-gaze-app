import { cn } from '@/lib/utils'

type FullLogoProps = {
  width?: number
  className?: string
  priority?: boolean
}

/**
 * Logo oficial YOUR GAZE: olhos femininos + texto "Your Gaze" embutidos
 * na própria imagem. Renderizada como <img> nativa para evitar o flicker
 * de reotimização do next/image em ambiente de desenvolvimento.
 */
export function FullLogo({ width = 220, className }: FullLogoProps) {
  const height = Math.round(width * 0.5625)
  return (
    <img
      src="/your-gaze-logo.png"
      alt="YOUR GAZE"
      width={width}
      height={height}
      loading="eager"
      decoding="sync"
      fetchPriority="high"
      style={{ mixBlendMode: 'multiply' }}
      className={cn('object-contain select-none', className)}
      draggable={false}
    />
  )
}
