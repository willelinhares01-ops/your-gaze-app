'use client'

import { useState } from 'react'
import {
  LogOut,
  ShieldCheck,
  ShieldAlert,
  LineChart,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Unlock,
  Lock,
  Trash2,
  ArrowUpRight,
  Wallet,
  BadgeCheck,
  ReceiptText,
  ChevronRight,
} from 'lucide-react'
import Image from 'next/image'
import { fontesReceita, makers } from '@/lib/data'
import { useApp } from '@/components/app-context'

// ─── Formatação ──────────────────────────────────────────────────────────────

const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

const usd = (v: number) =>
  v.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

// ─── Mock data ───────────────────────────────────────────────────────────────

const PERIODO = ['Dia', 'Semana', 'Mês', 'Ano'] as const
type Periodo = (typeof PERIODO)[number]

const TABS = ['Dashboard', 'Repasses', 'KYC', 'Contas'] as const
type Tab = (typeof TABS)[number]

// Multiplicadores por período (simulação)
const MULT: Record<Periodo, number> = { Dia: 1, Semana: 7, Mês: 30, Ano: 365 }

const REPASSE_STATUS = ['Pendente', 'Em Escrow', 'Processado'] as const
type RepasseStatus = (typeof REPASSE_STATUS)[number]

type Repasse = {
  id: string
  makerId: string
  receita: number
  repasse: number
  escrow: number
  status: RepasseStatus
}

const REPASSES: Repasse[] = [
  { id: 'r1', makerId: 'm1', receita: 57160, repasse: 48586, escrow: 6859,  status: 'Pendente'  },
  { id: 'r2', makerId: 'm2', receita: 38400, repasse: 32640, escrow: 0,     status: 'Em Escrow' },
  { id: 'r3', makerId: 'm3', receita: 29800, repasse: 25330, escrow: 0,     status: 'Processado'},
  { id: 'r4', makerId: 'm4', receita: 21500, repasse: 18275, escrow: 2150,  status: 'Pendente'  },
  { id: 'r5', makerId: 'm5', receita: 14200, repasse: 12070, escrow: 0,     status: 'Em Escrow' },
]

type KycEntry = {
  id: string
  nome: string
  docTipo: 'CPF' | 'Passaporte'
  docNumero: string
  pais: string
  envio: string
  status: 'Pendente' | 'Aprovado' | 'Rejeitado'
  avatar: string
}

const KYC_QUEUE: KycEntry[] = [
  { id: 'k1', nome: 'Isabela Monteiro',  docTipo: 'CPF',        docNumero: '421.***.*65-08', pais: 'Brasil',         envio: 'Hoje, 18h42', status: 'Pendente',  avatar: '/avatar-maker-2.png' },
  { id: 'k2', nome: 'Sofia Darien',      docTipo: 'Passaporte', docNumero: 'P2891***4',      pais: 'Espanha',        envio: 'Hoje, 14h11', status: 'Pendente',  avatar: '/avatar-maker-3.png' },
  { id: 'k3', nome: 'Camille Leclerc',   docTipo: 'Passaporte', docNumero: 'P7734***1',      pais: 'França',         envio: 'Ontem, 20h05',status: 'Pendente',  avatar: '/avatar-maker-1.png' },
  { id: 'k4', nome: 'Priya Sharma',      docTipo: 'Passaporte', docNumero: 'P9021***7',      pais: 'Índia',          envio: 'Ontem, 11h30',status: 'Aprovado',  avatar: '/avatar-maker-4.png' },
  { id: 'k5', nome: 'Beatriz Carvalho',  docTipo: 'CPF',        docNumero: '033.***.*91-44', pais: 'Brasil',         envio: '18 jun, 09h00',status:'Rejeitado', avatar: '/avatar-maker-5.png' },
]

const CONTAS = [
  ...makers.map((m, i) => ({
    nome: m.name, handle: m.handle, avatar: m.avatar, tipo: 'Maker',
    status: i === 3 ? 'Bloqueado' : 'Ativo',
  })),
  { nome: 'João P.',   handle: '@joaop',   avatar: '/avatar-user.png', tipo: 'Espectador',      status: 'Ativo'     },
  { nome: 'Marcos L.', handle: '@marcosl', avatar: '/avatar-user.png', tipo: 'Fiel Espectador', status: 'Ativo'     },
  { nome: 'Rafael S.', handle: '@rafas',   avatar: '/avatar-user.png', tipo: 'Espectador',      status: 'Bloqueado' },
]

// ─── Componente principal ─────────────────────────────────────────────────────

export function AdminScreen() {
  const { exitAdmin } = useApp()
  const [periodo, setPeriodo] = useState<Periodo>('Mês')
  const [tab, setTab] = useState<Tab>('Dashboard')
  const [kycQueue, setKycQueue] = useState<KycEntry[]>(KYC_QUEUE)
  const [repasses, setRepasses] = useState<Repasse[]>(REPASSES)
  const [contas, setContas] = useState(CONTAS)

  const mult = MULT[periodo]
  const bruto = fontesReceita.reduce((s, f) => s + f.valor, 0) * mult * 0.6 // USD base
  const takeRate = bruto * 0.15
  const impostos  = bruto * 0.30
  const mgm       = bruto * 0.11
  const makersPct = bruto * 0.85

  const kpiCards = [
    { icon: DollarSign,  label: 'Faturamento Bruto Global',   value: usd(bruto),     gold: false, trend: '+18%' },
    { icon: TrendingUp,  label: 'Lucro Líquido YOUR GAZE (15%)', value: usd(takeRate), gold: true,  trend: '+21%' },
    { icon: Users,       label: 'Makers Ativos',              value: '5',            gold: false, trend: '+1'   },
    { icon: LineChart,   label: 'Espectadores Ativos',        value: '3.241',        gold: false, trend: '+340' },
  ]

  const processarRepasse = (id: string) =>
    setRepasses((prev) => prev.map((r) => r.id === id ? { ...r, status: 'Processado' } : r))

  const kycAction = (id: string, acao: 'Aprovado' | 'Rejeitado') =>
    setKycQueue((prev) => prev.map((k) => k.id === id ? { ...k, status: acao } : k))

  const toggleConta = (nome: string) =>
    setContas((prev) => prev.map((c) => c.nome === nome
      ? { ...c, status: c.status === 'Ativo' ? 'Bloqueado' : 'Ativo' }
      : c))

  const excluirConta = (nome: string) =>
    setContas((prev) => prev.filter((c) => c.nome !== nome))

  return (
    <div className="min-h-screen bg-background px-6 py-8">

      {/* ── Cabeçalho ─────────────────────────────────────────── */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-navy">
            <ShieldCheck className="size-5 text-gold" />
          </span>
          <div>
            <h2 className="font-heading text-2xl text-navy">God Mode — Backoffice</h2>
            <p className="text-xs text-muted-foreground">
              Painel restrito · YOUR GAZE Admin · Controle macro da plataforma
            </p>
          </div>
        </div>
        <button
          onClick={exitAdmin}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-navy transition-colors hover:border-destructive hover:text-destructive"
        >
          <LogOut className="size-4" /> Sair do Admin
        </button>
      </header>

      {/* ── Filtro de período ──────────────────────────────────── */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Período:</span>
        {PERIODO.map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              periodo === p
                ? 'bg-navy text-primary-foreground'
                : 'text-navy/60 hover:text-navy'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div className="mb-6 flex gap-1 rounded-2xl border border-border bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-navy text-primary-foreground shadow-sm'
                : 'text-navy/60 hover:text-navy'
            }`}
          >
            {t === 'Dashboard' && <LineChart className="size-4" />}
            {t === 'Repasses'  && <Wallet    className="size-4" />}
            {t === 'KYC'       && <ShieldAlert className="size-4" />}
            {t === 'Contas'    && <Users     className="size-4" />}
            {t}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB — Dashboard
      ══════════════════════════════════════════════════════════ */}
      {tab === 'Dashboard' && (
        <section>
          {/* KPI cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {kpiCards.map((c) => {
              const Icon = c.icon
              return (
                <div
                  key={c.label}
                  className={`relative overflow-hidden rounded-2xl border bg-card p-5 ${
                    c.gold ? 'border-gold/40' : 'border-border'
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className={`flex size-8 items-center justify-center rounded-lg ${c.gold ? 'bg-gold/15 text-gold' : 'bg-navy/8 text-navy'}`}>
                      <Icon className="size-4" />
                    </span>
                    <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
                      <ArrowUpRight className="size-3" /> {c.trend}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{c.label}</p>
                  <p className={`mt-1 font-heading text-xl ${c.gold ? 'text-gold' : 'text-navy'}`}>
                    {c.value}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Gráfico de barras simulado */}
          <div className="mb-6 rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg text-navy">Receita Bruta — Evolução</h3>
              <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
                {periodo}
              </span>
            </div>
            <MiniBarChart periodo={periodo} />
          </div>

          {/* Detalhamento por fonte + take rate */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-4 font-heading text-lg text-navy">Receita por Fonte de Negócio</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Fonte</th>
                    <th className="pb-2 text-right font-medium">Bruto (USD)</th>
                    <th className="pb-2 text-right font-medium">Take 15%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {fontesReceita.filter((f) => f.valor > 0).map((f) => (
                    <tr key={f.nome}>
                      <td className="py-2 text-navy">{f.nome}</td>
                      <td className="py-2 text-right text-navy">{usd(f.valor * mult * 0.6)}</td>
                      <td className="py-2 text-right font-medium text-gold">{usd(f.valor * mult * 0.6 * 0.15)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-navy/20">
                  <tr>
                    <td className="pt-3 text-xs font-semibold text-navy">TOTAL</td>
                    <td className="pt-3 text-right font-semibold text-navy">{usd(bruto)}</td>
                    <td className="pt-3 text-right font-semibold text-gold">{usd(takeRate)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex flex-col gap-4">
              {/* Split pie */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 font-heading text-lg text-navy">Distribuição do Faturamento</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Repasse Makers (85%)',    value: makersPct, color: 'bg-navy'      },
                    { label: 'Lucro YOUR GAZE (15%)',   value: takeRate,  color: 'bg-gold'      },
                    { label: 'Impostos estimados (30%)',value: impostos,  color: 'bg-destructive/70' },
                    { label: 'MGM — Indicações (11%)',  value: mgm,       color: 'bg-navy/30'   },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{row.label}</span>
                        <span className="font-medium text-navy">{usd(row.value)}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full ${row.color}`}
                          style={{ width: `${(row.value / bruto) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alertas rápidos */}
              <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-navy">
                  <BadgeCheck className="size-4 text-gold" /> Status do Sistema
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Gateway Stripe: operacional
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Escrow automático: ativo (14 dias)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-amber-400" />
                    {kycQueue.filter((k) => k.status === 'Pendente').length} KYC(s) aguardando revisão
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-amber-400" />
                    {repasses.filter((r) => r.status === 'Pendente').length} repasse(s) pendente(s)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB — Repasses
      ══════════════════════════════════════════════════════════ */}
      {tab === 'Repasses' && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <ReceiptText className="size-5 text-gold" />
            <h3 className="font-heading text-lg text-navy">Split de Pagamento — Repasse às Makers</h3>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            Makers recebem 85% da receita gerada. Escrow de 14 dias sobre novos valores.
            Repasses processados via Stripe Connect.
          </p>

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/40">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Maker</th>
                  <th className="px-4 py-3 text-right font-medium">Receita Bruta</th>
                  <th className="px-4 py-3 text-right font-medium">Repasse (85%)</th>
                  <th className="px-4 py-3 text-right font-medium">Em Escrow</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {repasses.map((r) => {
                  const maker = makers.find((m) => m.id === r.makerId)
                  if (!maker) return null
                  return (
                    <tr key={r.id} className="hover:bg-secondary/20">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Image
                            src={maker.avatar}
                            alt={maker.name}
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-navy">{maker.name}</p>
                            <p className="text-xs text-muted-foreground">{maker.handle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-navy">
                        {usd(r.receita * MULT[periodo] * 0.02)}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-gold">
                        {usd(r.repasse * MULT[periodo] * 0.02)}
                      </td>
                      <td className="px-4 py-4 text-right text-muted-foreground">
                        {r.escrow > 0 ? usd(r.escrow) : '—'}
                      </td>
                      <td className="px-4 py-4">
                        <RepasseBadge status={r.status} />
                      </td>
                      <td className="px-5 py-4">
                        {r.status === 'Pendente' ? (
                          <button
                            onClick={() => processarRepasse(r.id)}
                            className="flex items-center gap-1.5 rounded-lg bg-gold px-3 py-2 text-xs font-semibold text-navy hover:opacity-90"
                          >
                            <ChevronRight className="size-3.5" /> Processar Repasse
                          </button>
                        ) : r.status === 'Em Escrow' ? (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="size-3.5" /> Aguardando 14 dias
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle2 className="size-3.5" /> Enviado
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Totais */}
          <div className="mt-4 flex flex-wrap justify-end gap-6 rounded-2xl border border-border bg-card px-6 py-4 text-sm">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Bruto (período)</p>
              <p className="font-heading text-lg text-navy">{usd(repasses.reduce((s, r) => s + r.receita * MULT[periodo] * 0.02, 0))}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Repasse</p>
              <p className="font-heading text-lg text-gold">{usd(repasses.reduce((s, r) => s + r.repasse * MULT[periodo] * 0.02, 0))}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">YOUR GAZE (15%)</p>
              <p className="font-heading text-lg text-navy">{usd(repasses.reduce((s, r) => s + r.receita * MULT[periodo] * 0.02 * 0.15, 0))}</p>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB — KYC
      ══════════════════════════════════════════════════════════ */}
      {tab === 'KYC' && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-gold" />
              <h3 className="font-heading text-lg text-navy">Controle de Qualidade — Fila KYC</h3>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
              {kycQueue.filter((k) => k.status === 'Pendente').length} pendentes
            </span>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            Makers aguardando validação de identidade (CPF / Passaporte). Documento validado antes de qualquer postagem ou saque.
          </p>

          <div className="flex flex-col gap-3">
            {kycQueue.map((k) => (
              <div
                key={k.id}
                className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 ${
                  k.status === 'Rejeitado'
                    ? 'border-destructive/30 bg-destructive/5'
                    : k.status === 'Aprovado'
                    ? 'border-emerald-400/30 bg-emerald-50/60'
                    : 'border-border bg-card'
                }`}
              >
                {/* Identidade */}
                <div className="flex items-center gap-4">
                  <Image
                    src={k.avatar}
                    alt={k.nome}
                    width={44}
                    height={44}
                    className="rounded-full object-cover ring-2 ring-gold/30"
                  />
                  <div>
                    <p className="font-medium text-navy">{k.nome}</p>
                    <p className="text-xs text-muted-foreground">{k.pais}</p>
                  </div>
                </div>

                {/* Documento */}
                <div className="min-w-[160px]">
                  <p className="text-xs text-muted-foreground">Documento</p>
                  <p className="text-sm font-medium text-navy">
                    {k.docTipo} · <span className="font-mono">{k.docNumero}</span>
                  </p>
                </div>

                {/* Envio */}
                <div>
                  <p className="text-xs text-muted-foreground">Enviado em</p>
                  <p className="flex items-center gap-1 text-sm text-navy">
                    <Clock className="size-3.5 text-muted-foreground" /> {k.envio}
                  </p>
                </div>

                {/* Status + Ações */}
                <div className="flex items-center gap-2">
                  {k.status === 'Pendente' ? (
                    <>
                      <button
                        onClick={() => kycAction(k.id, 'Aprovado')}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                      >
                        <CheckCircle2 className="size-3.5" /> Aprovar
                      </button>
                      <button
                        onClick={() => kycAction(k.id, 'Rejeitado')}
                        className="flex items-center gap-1.5 rounded-lg bg-destructive px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                      >
                        <XCircle className="size-3.5" /> Rejeitar
                      </button>
                    </>
                  ) : k.status === 'Aprovado' ? (
                    <span className="flex items-center gap-1.5 rounded-lg border border-emerald-400/50 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="size-3.5" /> Aprovado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-2 text-xs font-semibold text-destructive">
                      <XCircle className="size-3.5" /> Rejeitado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB — Contas
      ══════════════════════════════════════════════════════════ */}
      {tab === 'Contas' && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Users className="size-5 text-gold" />
            <h3 className="font-heading text-lg text-navy">Governança de Contas</h3>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            Relatórios, Escrow (trava de 14 dias) e controle total das contas da plataforma.
          </p>

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/40">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Usuário</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contas.map((u) => (
                  <tr key={u.nome} className="hover:bg-secondary/20">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={u.avatar}
                          alt={u.nome}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-navy">{u.nome}</p>
                          <p className="text-xs text-muted-foreground">{u.handle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.tipo === 'Maker' ? 'bg-navy/10 text-navy' : 'bg-gold/10 text-gold'
                      }`}>
                        {u.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${u.status === 'Bloqueado' ? 'text-destructive' : 'text-emerald-600'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5">
                        <button
                          title={u.status === 'Ativo' ? 'Bloquear conta' : 'Liberar conta'}
                          onClick={() => toggleConta(u.nome)}
                          className="rounded-md border border-border p-1.5 text-navy transition-colors hover:border-gold hover:text-gold"
                        >
                          {u.status === 'Ativo' ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
                        </button>
                        <button
                          title="Excluir permanentemente"
                          onClick={() => excluirConta(u.nome)}
                          className="rounded-md border border-border p-1.5 text-destructive/70 transition-colors hover:border-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

// ─── Sub-componentes utilitários ─────────────────────────────────────────────

function RepasseBadge({ status }: { status: RepasseStatus }) {
  if (status === 'Pendente')
    return (
      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
        <Clock className="size-3" /> Pendente
      </span>
    )
  if (status === 'Em Escrow')
    return (
      <span className="flex items-center gap-1 rounded-full bg-navy/10 px-2.5 py-1 text-xs font-medium text-navy">
        <Lock className="size-3" /> Em Escrow
      </span>
    )
  return (
    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
      <CheckCircle2 className="size-3" /> Processado
    </span>
  )
}

// Gráfico de barras simulado (sem biblioteca externa)
function MiniBarChart({ periodo }: { periodo: Periodo }) {
  const base = [32, 41, 38, 52, 49, 64, 71, 58, 66, 79, 83, 91]
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const mult = MULT[periodo]
  const data = (periodo === 'Ano' ? base : base.slice(-6)).map((v, i) => ({
    label: meses[i + (periodo === 'Ano' ? 0 : 6)],
    value: v * mult * 320,
  }))
  const max = Math.max(...data.map((d) => d.value))

  return (
    <div className="flex h-32 items-end gap-2">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div className="w-full rounded-t-md bg-navy/10 transition-all hover:bg-navy/20" style={{ height: `${(d.value / max) * 100}%` }}>
            <div className="h-full w-full rounded-t-md bg-gold/60 hover:bg-gold" />
          </div>
          <span className="text-[9px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  )
}
