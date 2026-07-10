'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

interface SubscribeCtaProps {
  makerHandle: string
  tierName: string
  isFeatured?: boolean
}

export function SubscribeCta({
  makerHandle,
  tierName,
  isFeatured = false,
}: SubscribeCtaProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')

  function handleSubscribe() {
    setState('loading')
    // Simula latência de checkout (Stripe redirect em produção)
    setTimeout(() => setState('done'), 1400)
  }

  if (state === 'done') {
    return (
      <div className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-400/40 py-2.5 text-xs font-bold text-emerald-400">
        <CheckCircle2 className="size-4" />
        Assinatura ativada!
      </div>
    )
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={state === 'loading'}
      className={`mt-4 w-full rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider shadow transition-all active:scale-[.97] disabled:cursor-wait ${
        isFeatured
          ? 'bg-amber-400 text-slate-950 hover:bg-amber-500'
          : 'bg-slate-900 text-amber-300 border border-amber-400/40 hover:bg-slate-800'
      }`}
    >
      {state === 'loading' ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="size-3.5 animate-spin" />
          Processando…
        </span>
      ) : (
        `Assinar · ${makerHandle}`
      )}
    </button>
  )
}
