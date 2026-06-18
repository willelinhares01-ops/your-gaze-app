'use client'

import { useState, useEffect } from 'react'
import { Radio, Trophy, Timer } from 'lucide-react'

const desejos = [
  { nome: 'Desejo 1', meta: 100, atual: 64 },
  { nome: 'Desejo 2', meta: 300, atual: 180 },
  { nome: 'Desejo 3', meta: 600, atual: 220 },
]

export function LivesScreen() {
  const [live, setLive] = useState(false)
  const [seconds, setSeconds] = useState(180)

  useEffect(() => {
    if (!live) return
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [live])

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <div className="px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-navy">Transmissões</h2>
          <p className="text-sm text-muted-foreground">Game de Lives com Leilão de Desejos.</p>
        </div>
        <button
          onClick={() => {
            setLive((v) => !v)
            setSeconds(180)
          }}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold ${
            live ? 'bg-destructive text-primary-foreground' : 'bg-gold text-navy'
          }`}
        >
          <Radio className="size-4" />
          {live ? 'Encerrar Live' : 'Abrir Live'}
        </button>
      </header>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-heading text-lg text-navy">
            <Trophy className="size-5 text-gold" /> Leilão de Desejos
          </h3>
          <span className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-sm font-semibold text-gold">
            <Timer className="size-4" /> {mm}:{ss}
          </span>
        </div>
        <p className="mb-5 text-xs text-muted-foreground">
          Os fãs competem enviando gorjetas no cronômetro. Quem atingir a meta primeiro libera a ação.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {desejos.map((d) => (
            <div key={d.nome} className="rounded-xl border border-border p-4">
              <p className="mb-2 text-sm font-semibold text-navy">{d.nome}</p>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>US$ {d.atual}</span>
                <span>Meta US$ {d.meta}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-gold" style={{ width: `${(d.atual / d.meta) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
