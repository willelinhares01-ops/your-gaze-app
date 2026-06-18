'use client'

import { Lock } from 'lucide-react'
import { useApp } from '@/components/app-context'

/**
 * Cartão de bloqueio reutilizável. Aparece quando o Espectador ainda não é
 * Fiel Espectador. O botão leva à tela de Assinaturas para fazer o checkout.
 */
export function LockGate({
  title,
  description,
}: {
  title: string
  description: string
}) {
  const { navigate } = useApp()
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-gold/50 bg-gold/5 px-8 py-12 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-gold/15">
        <Lock className="size-8 text-gold" strokeWidth={1.75} />
      </span>
      <h3 className="font-heading text-2xl text-navy">{title}</h3>
      <p className="text-sm text-muted-foreground text-balance">{description}</p>
      <button
        type="button"
        onClick={() => navigate('assinaturas')}
        className="mt-2 rounded-xl bg-gold px-8 py-3 text-sm font-semibold text-navy transition-opacity hover:opacity-90"
      >
        Ver Assinaturas
      </button>
    </div>
  )
}
