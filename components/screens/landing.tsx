'use client'

import { FullLogo } from '@/components/brand/full-logo'
import { useApp } from '@/components/app-context'
import { useDict } from '@/lib/locale-context'

export function Landing() {
  const { startOnboarding, startLogin } = useApp()
  const t = useDict()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 bg-background px-6">
      <div className="flex flex-col items-center gap-5">
        <FullLogo width={360} className="w-[280px] sm:w-[360px]" />
        <p className="max-w-md font-heading text-2xl italic font-medium text-navy text-balance sm:text-3xl">
          {t.landing.slogan}
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-4">
        <button
          type="button"
          onClick={() => startOnboarding('espectador')}
          className="rounded-xl border-2 border-navy bg-gold py-4 text-base font-semibold tracking-wide text-navy transition-opacity hover:opacity-90"
        >
          {t.landing.btn_espectador}
        </button>
        <button
          type="button"
          onClick={() => startOnboarding('maker')}
          className="rounded-xl border-2 border-gold bg-navy py-4 text-base font-semibold tracking-wide text-gold transition-opacity hover:opacity-90"
        >
          {t.landing.btn_maker}
        </button>
        <button
          type="button"
          onClick={startLogin}
          className="mt-2 text-sm text-muted-foreground transition-colors hover:text-navy"
        >
          {t.landing.ja_tenho_conta}{' '}
          <span className="font-semibold text-navy">— {t.landing.entrar}</span>
        </button>
      </div>
    </main>
  )
}
