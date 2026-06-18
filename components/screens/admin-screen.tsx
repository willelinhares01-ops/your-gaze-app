'use client'

import { useState } from 'react'
import { LogOut, ShieldCheck, Unlock, Lock, Trash2 } from 'lucide-react'
import { fontesReceita, makers } from '@/lib/data'
import { useApp } from '@/components/app-context'

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const FILTROS = ['Dia', 'Semana', 'Mês', 'Ano'] as const

export function AdminScreen() {
  const { exitAdmin } = useApp()
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]>('Mês')

  const bruto = fontesReceita.reduce((s, f) => s + f.valor, 0)
  const comissao = Math.round(bruto * 0.15)
  const totalGlobal = bruto * 6 // simulação de várias contas

  const usuarios = [
    ...makers.map((m, i) => ({ nome: m.name, tipo: 'Maker', status: i % 4 === 0 ? 'Bloqueado' : 'Ativo' })),
    { nome: 'João P.', tipo: 'Espectador', status: 'Ativo' },
    { nome: 'Marcos L.', tipo: 'Fiel Espectador', status: 'Ativo' },
  ]

  return (
    <div className="px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-6 text-gold" />
          <div>
            <h2 className="font-heading text-2xl text-navy">Backoffice — Admin Geral</h2>
            <p className="text-sm text-muted-foreground">Controle macro da plataforma YOUR GAZE.</p>
          </div>
        </div>
        <button onClick={exitAdmin} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-navy hover:border-destructive hover:text-destructive">
          <LogOut className="size-4" /> Sair do Admin
        </button>
      </header>

      <div className="mb-6 flex gap-2">
        {FILTROS.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`rounded-full px-4 py-1.5 text-sm ${filtro === f ? 'bg-navy text-primary-foreground' : 'text-navy/60 hover:text-navy'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Faturamento Bruto Global', value: brl(totalGlobal) },
          { label: 'Comissão YOUR GAZE (15%)', value: brl(totalGlobal * 0.15), gold: true },
          { label: 'Impostos por país (30%)', value: brl(totalGlobal * 0.3) },
          { label: 'Repasses MGM (11%)', value: brl(totalGlobal * 0.11) },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5">
            <span className="text-xs text-muted-foreground">{c.label}</span>
            <p className={`mt-2 font-heading text-2xl ${c.gold ? 'text-gold' : 'text-navy'}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Detalhamento global por fonte */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-4 font-heading text-lg text-navy">Detalhamento Global por Fonte</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="pb-2">Fonte</th>
                <th className="pb-2 text-right">Bruto</th>
                <th className="pb-2 text-right">Nossa fatia (15%)</th>
              </tr>
            </thead>
            <tbody>
              {fontesReceita.filter((f) => f.valor > 0).map((f) => (
                <tr key={f.nome} className="border-t border-border">
                  <td className="py-2 text-navy">{f.nome}</td>
                  <td className="py-2 text-right text-navy">{brl(f.valor * 6)}</td>
                  <td className="py-2 text-right text-gold">{brl(f.valor * 6 * 0.15)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Governança de contas */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="mb-1 font-heading text-lg text-navy">Governança de Conta</h3>
          <p className="mb-4 text-xs text-muted-foreground">Relatórios, Escrow (trava de 14 dias) e poder sobre as contas.</p>
          <ul className="divide-y divide-border">
            {usuarios.map((u) => (
              <li key={u.nome} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-navy">{u.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {u.tipo} ·{' '}
                    <span className={u.status === 'Bloqueado' ? 'text-destructive' : 'text-gold'}>{u.status}</span>
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button title="Liberar conta" className="rounded-md border border-border p-1.5 text-navy hover:border-gold hover:text-gold">
                    <Unlock className="size-3.5" />
                  </button>
                  <button title="Bloquear conta" className="rounded-md border border-border p-1.5 text-navy hover:border-gold hover:text-gold">
                    <Lock className="size-3.5" />
                  </button>
                  <button title="Excluir permanentemente" className="rounded-md border border-border p-1.5 text-destructive hover:bg-destructive/10">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
