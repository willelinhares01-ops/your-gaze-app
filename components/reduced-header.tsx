import { FullLogo } from '@/components/brand/full-logo'

export function ReducedHeader() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-center border-b border-border bg-background/90 py-3 backdrop-blur">
      <FullLogo width={132} />
    </header>
  )
}
