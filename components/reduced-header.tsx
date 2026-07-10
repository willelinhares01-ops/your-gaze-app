'use client'

import { LogOut } from 'lucide-react'
import { FullLogo } from '@/components/brand/full-logo'
import { useApp } from '@/components/app-context'

export function ReducedHeader() {
  const { logout } = useApp()

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
      <div className="w-8" />
      <FullLogo width={132} />
      <button
        type="button"
        onClick={logout}
        title="Sair da conta"
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-navy/60 transition-colors hover:bg-secondary hover:text-navy"
      >
        <LogOut className="h-4 w-4" strokeWidth={1.75} />
        <span className="hidden sm:inline">Sair</span>
      </button>
    </header>
  )
}
