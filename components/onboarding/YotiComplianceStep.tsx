'use client'

import { useState } from 'react'
import { ShieldCheck, Fingerprint, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface YotiComplianceProps {
  /** Handle ou nome do Maker em processo de onboarding */
  makerHandle?: string
  /**
   * Callback acionado quando todos os termos são aceitos e o Yoti retorna VERIFIED.
   * Recebe o `verificationId` para persistência no banco/estado global.
   */
  onComplianceApproved: (verificationId: string) => void
}

type VerificationState = 'IDLE' | 'SCANNING' | 'VERIFIED' | 'REJECTED'

// ─── Definição dos termos (type-safe e iterável) ──────────────────────────────

type TermKey = 'ip' | 'split' | 'kyc'

interface Term {
  key: TermKey
  title: string
  body: string
  highlight?: string   // trecho a exibir em amber-400
}

const TERMS: Term[] = [
  {
    key:   'ip',
    title: '1. Soberania Autoral 100%',
    body:  'Declaro ser o titular integral dos direitos de propriedade intelectual das mídias, lives e conteúdos PPV que disponibilizo. A Your Gaze Hub opera unicamente como infraestrutura tecnológica de intermediação, sem exercer qualquer controle editorial sobre o conteúdo.',
  },
  {
    key:       'split',
    title:     '2. Governança Tributária & Repasse (85/15)',
    body:      'Concordo com o repasse líquido fixo de {{highlight}} e a taxa operacional fixa de 15% da plataforma, com precificação e liquidação ancoradas em Dólar Americano (USD $). A cobrança da comissão MGM Fundadores ocorre exclusivamente sobre a fatia de 15% — sem impacto no repasse ao Maker.',
    highlight: '85% sobre as vendas brutas',
  },
  {
    key:   'kyc',
    title: '3. Paridade Biométrica & Antifraude',
    body:  'Estou ciente de que saques em USD ($) só serão processados para conta bancária titular (Pessoa Física ou CNPJ próprio) perfeitamente coincidente com a biometria autenticada via Yoti. Intermediários, laranjas e terceiros são bloqueados automaticamente pelo sistema antifraude.',
  },
]

// ─── Subcomponentes internos ───────────────────────────────────────────────────

function TermCard({
  term,
  checked,
  onChange,
}: {
  term: Term
  checked: boolean
  onChange: (key: TermKey) => void
}) {
  // Renderiza o body com o trecho highlight em amber-400 (quando presente)
  function renderBody() {
    if (!term.highlight) return <span>{term.body}</span>
    const [before, after] = term.body.split('{{highlight}}')
    return (
      <>
        {before}
        <strong className="text-amber-400">{term.highlight}</strong>
        {after}
      </>
    )
  }

  return (
    <label className="flex cursor-pointer items-start gap-3.5 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 transition-colors hover:border-amber-500/40">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onChange(term.key)}
        className="mt-1 size-5 shrink-0 rounded border-slate-700 bg-slate-950 accent-amber-500 focus:ring-amber-400 focus:ring-offset-slate-950"
      />
      <div className="text-xs leading-relaxed text-slate-400">
        <span className="mb-1 block text-sm font-bold text-slate-200">{term.title}</span>
        {renderBody()}
      </div>
    </label>
  )
}

function ScanningState() {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="relative flex size-16 items-center justify-center">
        <Loader2 className="size-10 animate-spin text-amber-400" />
        <Fingerprint className="absolute size-5 text-amber-300 opacity-80" />
      </div>
      <div className="text-center">
        <h3 className="font-serif text-lg font-bold text-amber-400">
          Autenticando via Yoti Secure Server...
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          Cruzando dados documentais com criptografia de ponta a ponta.
        </p>
      </div>
    </div>
  )
}

function VerifiedState() {
  return (
    <div className="flex flex-col items-center gap-3 py-6 animate-fade-in">
      <div className="flex size-14 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/15">
        <CheckCircle2 className="size-7 text-emerald-400" strokeWidth={1.75} />
      </div>
      <div className="text-center">
        <h3 className="font-serif text-lg font-bold text-white">
          Identidade Soberana Confirmada!
        </h3>
        <p className="mt-1 text-xs font-semibold text-emerald-400">
          KYC Biométrico Ativo · Saques em USD ($) Liberados · Repasse 85%
        </p>
      </div>
    </div>
  )
}

function RejectedState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="flex size-14 items-center justify-center rounded-full border border-red-500/40 bg-red-500/10">
        <AlertTriangle className="size-7 text-red-400" strokeWidth={1.75} />
      </div>
      <div className="text-center">
        <h3 className="font-serif text-lg font-bold text-white">Verificação Não Concluída</h3>
        <p className="mt-1 text-xs text-slate-400">
          Não foi possível confirmar sua identidade. Verifique a iluminação e tente novamente.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl border border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:border-amber-400/40 hover:text-white"
      >
        Tentar novamente
      </button>
    </div>
  )
}

// ─── YotiComplianceStep ───────────────────────────────────────────────────────

/**
 * Etapa de verificação jurídica e biométrica do Maker.
 *
 * Exibe os 3 termos de compliance (Soberania Autoral, Split 85/15, KYC Antifraude)
 * e orquestra a simulação E2E do webhook Yoti Biometrics.
 *
 * Integração com o fluxo de onboarding:
 * ```tsx
 * {step === 'maker-kyc' && (
 *   <YotiComplianceStep
 *     makerHandle="@joaosilva"
 *     onComplianceApproved={(id) => {
 *       currentMaker.kycStatus = 'VERIFIED'
 *       advanceStep()
 *     }}
 *   />
 * )}
 * ```
 */
export function YotiComplianceStep({
  makerHandle = '@novoMaker',
  onComplianceApproved,
}: YotiComplianceProps) {
  const [accepted, setAccepted] = useState<Record<TermKey, boolean>>({
    ip: false, split: false, kyc: false,
  })
  const [verifyState, setVerifyState] = useState<VerificationState>('IDLE')

  const allTermsAccepted = (Object.values(accepted) as boolean[]).every(Boolean)

  function toggleTerm(key: TermKey) {
    setAccepted((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function handleStartYotiScan() {
    if (!allTermsAccepted) return
    setVerifyState('SCANNING')

    // Simulação E2E de latência do Webhook Yoti Biometrics (2.5 s)
    window.setTimeout(() => {
      setVerifyState('VERIFIED')
      window.setTimeout(() => {
        onComplianceApproved('yoti-auth-kyc-99482-br')
      }, 1_200)
    }, 2_500)
  }

  function handleRetry() {
    setVerifyState('IDLE')
    setAccepted({ ip: false, split: false, kyc: false })
  }

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-amber-500/30 bg-slate-950 p-8 text-slate-100 shadow-[0_0_40px_rgba(10,25,47,0.9)]">

      {/* ── Cabeçalho Institucional ──────────────────────────────────────── */}
      <header className="mb-6 border-b border-slate-800 pb-5 text-center">
        <span className="text-xs font-black uppercase tracking-[0.25em] text-amber-400">
          Your Gaze Hub · Governança Jurídica
        </span>
        <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl">
          Soberania & Verificação Yoti KYC
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Para ativar recebimentos em USD ($) e proteger seu patrimônio, confirme as
          diretrizes operacionais do ecossistema.
        </p>
      </header>

      {/* ── Termos Interativos ───────────────────────────────────────────── */}
      <div className="mb-8 space-y-3">
        {TERMS.map((term) => (
          <TermCard
            key={term.key}
            term={term}
            checked={accepted[term.key]}
            onChange={toggleTerm}
          />
        ))}
      </div>

      {/* ── Zona Biométrica Yoti ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">

        {verifyState === 'IDLE' && (
          <>
            {/* Status do gateway */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-300">
              <span className="size-2 rounded-full bg-amber-400" aria-hidden="true" />
              Gateway Biométrico Yoti Pronto
            </div>

            <p className="mx-auto mb-5 max-w-md text-xs text-slate-400">
              Ao iniciar a verificação, validaremos sua identidade por reconhecimento facial
              documental para liberar a conta soberana{' '}
              <strong className="text-amber-400">{makerHandle}</strong>.
            </p>

            <button
              type="button"
              onClick={handleStartYotiScan}
              disabled={!allTermsAccepted}
              aria-disabled={!allTermsAccepted}
              className={`w-full rounded-xl px-8 py-4 text-sm font-bold shadow-lg transition-all sm:w-auto ${
                allTermsAccepted
                  ? 'cursor-pointer bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-amber-500/20 hover:scale-[1.02] active:scale-[.98]'
                  : 'cursor-not-allowed border border-slate-700 bg-slate-800 text-slate-500'
              }`}
            >
              {allTermsAccepted
                ? '🔐 Iniciar Autenticação Biométrica (Yoti)'
                : '⚠️ Aceite as 3 Diretrizes Acima'}
            </button>
          </>
        )}

        {verifyState === 'SCANNING'  && <ScanningState />}
        {verifyState === 'VERIFIED'  && <VerifiedState />}
        {verifyState === 'REJECTED'  && <RejectedState onRetry={handleRetry} />}

      </div>

      {/* ── Nota de segurança ────────────────────────────────────────────── */}
      <p className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-600">
        <ShieldCheck className="size-3 text-emerald-700" strokeWidth={2} />
        Verificação processada por Yoti Ltd. · Dados biométricos não armazenados pela plataforma.
      </p>
    </div>
  )
}
