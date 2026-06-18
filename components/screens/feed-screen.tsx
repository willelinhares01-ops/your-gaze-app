'use client'

import { useMemo, useState } from 'react'
import { Stories } from '@/components/stories'
import { Feed } from '@/components/feed'
import { LockGate } from '@/components/lock-gate'
import { useApp } from '@/components/app-context'
import { posts as allPosts, currentMaker } from '@/lib/data'
import { cn } from '@/lib/utils'

const TABS = [
  { key: 'feed', label: 'Feed' },
  { key: 'alta', label: 'Em Alta' },
  { key: 'recente', label: 'Recente' },
] as const
type Tab = (typeof TABS)[number]['key']

export function FeedScreen() {
  const { isFiel, accountType } = useApp()
  const [tab, setTab] = useState<Tab>('feed')
  const isMaker = accountType === 'maker'
  // Maker sempre vê o próprio histórico; Espectador precisa ser Fiel.
  const unlocked = isFiel || isMaker

  const visiblePosts = useMemo(() => {
    // No feed do Maker entram apenas as postagens dele.
    const base = isMaker
      ? allPosts.filter((p) => p.maker.id === currentMaker.id)
      : allPosts

    const list = [...base]
    if (tab === 'alta') {
      // Em Alta: mais vistas e que mais vendem (assinaturas + avulsos).
      return list.sort((a, b) => b.views + b.sales * 50 - (a.views + a.sales * 50))
    }
    if (tab === 'recente') {
      // Recente: últimas postagens em tempo real.
      return list.sort((a, b) => a.minsAgo - b.minsAgo)
    }
    return list
  }, [isMaker, tab])

  return (
    <div>
      {/* Espectador não cria histórias — apenas vê as dos Makers. */}
      <Stories canCreate={isMaker} />

      <nav className="sticky top-[69px] z-10 flex items-center justify-center gap-1 border-b border-border bg-background/90 px-6 py-3 backdrop-blur">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'rounded-full px-4 py-2 text-sm transition-colors',
              tab === t.key
                ? 'bg-navy font-medium text-primary-foreground'
                : 'text-navy/60 hover:text-navy',
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {unlocked ? (
        <>
          {isMaker && (
            <p className="px-6 pt-6 text-sm text-muted-foreground">
              {tab === 'feed' && 'Suas postagens de pacotes de assinatura e degustação.'}
              {tab === 'alta' && 'Suas postagens mais vistas e que mais vendem assinaturas e avulsos.'}
              {tab === 'recente' && 'Suas últimas postagens, em tempo real.'}
            </p>
          )}
          {/* Métricas de views/vendas só aparecem para o próprio Maker. */}
          <Feed posts={visiblePosts} showStats={isMaker} />
        </>
      ) : (
        <div className="px-6 py-12">
          <LockGate
            title="Feed bloqueado"
            description="Assine um Maker para ler os posts completos. Como Espectador você só tem acesso à Degustação."
          />
        </div>
      )}
    </div>
  )
}
