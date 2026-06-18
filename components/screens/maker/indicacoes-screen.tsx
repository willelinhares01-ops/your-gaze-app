'use client'

import { useState } from 'react'
import { Link2, Copy, Check, Gift } from 'lucide-react'

export function IndicacoesScreen() {
  const [link, setLink] = useState('')
  const [copied, setCopied] = useState(false)

  const gerar = () => setLink('https://yourgaze.br/r/valentina-' + Math.random().toString(36).slice(2, 8))

  return (
    <div className="px-6 py-8">
      <header className="mb-6">
        <h2 className="font-heading text-2xl text-navy">Indicações (MGM)</h2>
        <p className="text-sm text-muted-foreground">
          Ganhe de 1% a 2% vitalício sobre os novos Makers que você trouxer.
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-6">
        {!link ? (
          <button
            onClick={gerar}
            className="flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-navy hover:opacity-90"
          >
            <Link2 className="size-4" /> Gerar Link de Indicação
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-gold/50 bg-gold/5 p-3">
            <span className="flex-1 truncate text-sm text-navy">{link}</span>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(link)
                setCopied(true)
                setTimeout(() => setCopied(false), 1500)
              }}
              className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-xs font-medium text-primary-foreground"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { label: 'Makers indicados', value: '7' },
          { label: 'Comissão vitalícia', value: '2%' },
          { label: 'Ganhos por indicação', value: 'R$ 1.140' },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Gift className="size-4" />
              <span className="text-xs">{c.label}</span>
            </div>
            <p className="font-heading text-2xl text-gold">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
