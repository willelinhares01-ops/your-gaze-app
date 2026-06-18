'use client'

import { useState } from 'react'
import { X, CreditCard, Crown, Loader2, Check } from 'lucide-react'
import { useApp } from '@/components/app-context'

const field =
  'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-gold'

/**
 * Checkout estilo Stripe. Ao inserir o cartão e confirmar, o Espectador é
 * promovido automaticamente a Fiel Espectador (sem carteira virtual).
 */
export function CheckoutModal({
  plan,
  price,
  maker,
  onClose,
}: {
  plan: string
  price: string
  maker?: string
  onClose: () => void
}) {
  const { becomeFiel } = useApp()
  const [status, setStatus] = useState<'form' | 'processing' | 'done'>('form')

  const pay = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('processing')
    setTimeout(() => {
      setStatus('done')
      becomeFiel()
    }, 1800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-xl text-navy">
            {plan}
            {maker ? ` · ${maker}` : ''}
          </h3>
          <button onClick={onClose} aria-label="Fechar" className="text-muted-foreground hover:text-navy">
            <X className="size-5" />
          </button>
        </div>

        {status === 'done' ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-gold/15 text-gold">
              <Crown className="size-8" />
            </span>
            <p className="font-heading text-2xl text-navy">
              Você agora é Fiel Espectador{maker ? ` de ${maker}` : ''}!
            </p>
            <p className="text-sm text-muted-foreground">
              Conteúdo desbloqueado no perfil: Feed, Degustação sem blur e Transmissões liberadas.
            </p>
            <button
              onClick={onClose}
              className="mt-2 rounded-xl bg-gold px-8 py-3 text-sm font-semibold text-navy hover:opacity-90"
            >
              Aproveitar agora
            </button>
          </div>
        ) : (
          <form onSubmit={pay} className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg bg-secondary px-4 py-3">
              <span className="text-sm text-navy">Total mensal</span>
              <span className="font-semibold text-gold">{price}</span>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Número do cartão</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input required placeholder="4242 4242 4242 4242" className={field + ' pl-9'} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Validade</label>
                <input required placeholder="MM/AA" className={field} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">CVV</label>
                <input required placeholder="123" className={field} />
              </div>
            </div>
            <button
              type="submit"
              disabled={status === 'processing'}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-navy py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {status === 'processing' ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Processando...
                </>
              ) : (
                <>
                  <Check className="size-4" /> Pagar {price}
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-muted-foreground">
              Pagamento seguro via Stripe. Sem carteira virtual — cobramos direto no cartão.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
