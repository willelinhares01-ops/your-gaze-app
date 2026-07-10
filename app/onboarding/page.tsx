'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FullLogo } from '@/components/brand/full-logo'
import { YotiComplianceStep } from '@/components/onboarding/YotiComplianceStep'
import { currentMaker } from '@/lib/data'
import {
  User,
  ScrollText,
  Fingerprint,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type OnboardingStep = 'identity' | 'governance' | 'maker-kyc' | 'complete'

interface MakerProfile {
  nome:   string
  handle: string
  email:  string
}

// ─── Barra de progresso ───────────────────────────────────────────────────────

const STEPS: { key: OnboardingStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'identity',   label: 'Identidade',   icon: User        },
  { key: 'governance', label: 'Governança',   icon: ScrollText  },
  { key: 'maker-kyc',  label: 'KYC Yoti',     icon: Fingerprint },
  { key: 'complete',   label: 'Concluído',    icon: CheckCircle2 },
]

function StepBar({ current }: { current: OnboardingStep }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current)
  return (
    <nav className="flex items-center gap-0" aria-label="Progresso do cadastro">
      {STEPS.map((s, i) => {
        const Icon     = s.icon
        const done     = i < currentIdx
        const active   = i === currentIdx
        const isLast   = i === STEPS.length - 1

        return (
          <div key={s.key} className="flex items-center">
            <div
              className={`flex flex-col items-center gap-1 px-2 sm:px-3 ${
                active ? 'opacity-100' : done ? 'opacity-70' : 'opacity-30'
              }`}
            >
              <span
                className={`flex size-8 items-center justify-center rounded-full border-2 transition-all ${
                  done
                    ? 'border-amber-400 bg-amber-400 text-slate-950'
                    : active
                    ? 'border-amber-400 bg-slate-950 text-amber-400'
                    : 'border-slate-700 bg-slate-900 text-slate-600'
                }`}
              >
                {done ? (
                  <CheckCircle2 className="size-4" strokeWidth={2.5} />
                ) : (
                  <Icon className="size-3.5" />
                )}
              </span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:block">
                {s.label}
              </span>
            </div>

            {!isLast && (
              <div
                className={`h-px w-8 transition-colors sm:w-12 ${
                  i < currentIdx ? 'bg-amber-400/60' : 'bg-slate-800'
                }`}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}

// ─── Etapa 1: Identidade ──────────────────────────────────────────────────────

function IdentityStep({
  profile,
  onChange,
  onNext,
}: {
  profile: MakerProfile
  onChange: (p: Partial<MakerProfile>) => void
  onNext: () => void
}) {
  const valid = profile.nome.trim().length >= 2 && profile.email.includes('@')

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
          Sua Identidade de Criador
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Como você quer ser reconhecido pelos Espectadores no ecossistema?
        </p>
      </div>

      <div className="space-y-4">
        {[
          { label: 'Nome completo', key: 'nome' as const,   type: 'text',     placeholder: 'Ex: Ana Paula Silva'    },
          { label: 'Handle público', key: 'handle' as const, type: 'text',    placeholder: '@anapaula'              },
          { label: 'E-mail',         key: 'email' as const,  type: 'email',   placeholder: 'seu@email.com'          },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key}>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              {label}
            </label>
            <input
              type={type}
              value={profile[key]}
              placeholder={placeholder}
              onChange={(e) => onChange({ [key]: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!valid}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 py-4 text-sm font-bold text-slate-950 shadow-lg shadow-amber-400/20 transition-all hover:opacity-95 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continuar <ChevronRight className="size-4" />
      </button>
    </div>
  )
}

// ─── Etapa 2: Governança 85/15 ────────────────────────────────────────────────

const GOV_POINTS = [
  {
    label: 'Repasse Líquido Fixo',
    value: '85%',
    desc:  'Sobre cada venda bruta — assinatura, PPV, Mimo, leilão ou curso.',
  },
  {
    label: 'Taxa de Plataforma',
    value: '15%',
    desc:  'Cobre infraestrutura, gateway, suporte e programa MGM Fundadores.',
  },
  {
    label: 'Moeda de Liquidação',
    value: 'USD $',
    desc:  'Todas as transações são precificadas e liquidadas em Dólar Americano.',
  },
  {
    label: 'Autonomia de Preços',
    value: '100%',
    desc:  'O Maker define seus próprios preços sem teto ou interferência da plataforma.',
  },
]

function GovernanceStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
          Governança Financeira
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Entenda as regras de repasse antes de verificar sua identidade.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {GOV_POINTS.map(({ label, value, desc }) => (
          <div
            key={label}
            className="flex flex-col gap-1 rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
            <p className="font-serif text-3xl font-black text-amber-400">{value}</p>
            <p className="text-xs leading-relaxed text-slate-500">{desc}</p>
          </div>
        ))}
      </div>

      {/* Nota MGM */}
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/15 bg-amber-400/5 px-4 py-3">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-400" strokeWidth={1.75} />
        <p className="text-xs leading-relaxed text-slate-400">
          A comissão MGM (Makers Fundadores #1–#1.000: 2% vitalício) é deduzida da fatia de
          15% da plataforma — o Maker indicado recebe seus 85% integralmente.
          Não existe nenhum desconto sobre o repasse do criador.
        </p>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 py-4 text-sm font-bold text-slate-950 shadow-lg shadow-amber-400/20 transition-all hover:opacity-95 active:scale-[.98]"
      >
        Entendido — Avançar para KYC <ChevronRight className="size-4" />
      </button>
    </div>
  )
}

// ─── Etapa 4: Conclusão ───────────────────────────────────────────────────────

function CompleteStep({
  profile,
  kycId,
}: {
  profile: MakerProfile
  kycId: string
}) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center gap-6 py-4 text-center">
      <div className="flex size-20 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
        <CheckCircle2 className="size-10 text-emerald-400" strokeWidth={1.5} />
      </div>

      <div>
        <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
          Conta Maker Ativada!
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Bem-vindo ao ecossistema, <strong className="text-amber-400">{profile.handle || profile.nome}</strong>.
          Seus saques em USD ($) já estão liberados.
        </p>
      </div>

      {/* Resumo do KYC */}
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4 text-left">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
          Resumo de Verificação
        </p>
        {[
          { label: 'KYC Status',       value: 'VERIFIED',     valueClass: 'text-emerald-400' },
          { label: 'ID de Verificação', value: kycId,          valueClass: 'text-slate-300'   },
          { label: 'Repasse Líquido',  value: '85% em USD $', valueClass: 'text-amber-400'   },
          { label: 'Saques',           value: 'Liberados',    valueClass: 'text-emerald-400' },
        ].map(({ label, value, valueClass }) => (
          <div key={label} className="flex items-center justify-between border-t border-slate-800 py-2 text-xs">
            <span className="text-slate-500">{label}</span>
            <span className={`font-bold ${valueClass}`}>{value}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => router.push('/app')}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-8 py-4 text-sm font-extrabold text-slate-950 shadow-xl shadow-amber-400/25 transition-all hover:opacity-95 active:scale-[.98]"
      >
        Acessar Meu Estúdio <ArrowRight className="size-4" />
      </button>

      <Link href="/" className="text-xs text-slate-600 underline underline-offset-2 hover:text-slate-400">
        Voltar à página inicial
      </Link>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [step, setStep]       = useState<OnboardingStep>('identity')
  const [kycId, setKycId]     = useState('')
  const [profile, setProfile] = useState<MakerProfile>({ nome: '', handle: '', email: '' })

  function updateProfile(patch: Partial<MakerProfile>) {
    setProfile((prev) => ({ ...prev, ...patch }))
  }

  // Callback do YotiComplianceStep — salva kycStatus no perfil global (in-memory)
  const handleComplianceApproved = useCallback((verificationId: string) => {
    setKycId(verificationId)
    // Persiste a flag kycStatus no Maker ativo (in-memory — substituir por Supabase RPC em produção)
    currentMaker.kycStatus = 'VERIFIED'
    setStep('complete')
  }, [])

  const makerHandle = profile.handle
    ? profile.handle.startsWith('@') ? profile.handle : `@${profile.handle}`
    : profile.nome
    ? `@${profile.nome.toLowerCase().replace(/\s+/g, '').slice(0, 20)}`
    : '@novoMaker'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">

      {/* ── Topo ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          {/* Logo em pill branca — blend multiply */}
          <div className="overflow-hidden rounded-lg bg-white px-3 py-1.5 shadow-sm">
            <FullLogo width={88} className="w-[70px]" />
          </div>
          <StepBar current={step} />
        </div>
      </header>

      {/* ── Conteúdo central ──────────────────────────────────────────────── */}
      <main className="mx-auto max-w-2xl px-6 py-12">

        {step === 'identity' && (
          <IdentityStep
            profile={profile}
            onChange={updateProfile}
            onNext={() => setStep('governance')}
          />
        )}

        {step === 'governance' && (
          <GovernanceStep onNext={() => setStep('maker-kyc')} />
        )}

        {step === 'maker-kyc' && (
          <YotiComplianceStep
            makerHandle={makerHandle}
            onComplianceApproved={handleComplianceApproved}
          />
        )}

        {step === 'complete' && (
          <CompleteStep profile={profile} kycId={kycId} />
        )}
      </main>

      {/* ── Rodapé mínimo ─────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-6 py-5 text-center">
        <p className="text-[10px] text-slate-700">
          Your Gaze Hub · Repasse 85% ao Maker · KYC via Yoti · Multi-moeda USD
        </p>
      </footer>

    </div>
  )
}
