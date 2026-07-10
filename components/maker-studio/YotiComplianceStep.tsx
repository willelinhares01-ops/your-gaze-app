'use client'

import React, { useState } from 'react'

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export interface YotiComplianceProps {
  /** Nome ou Handle do Maker em processo de onboarding */
  makerHandle?: string
  /** Callback acionado quando todos os termos são aceitos e o Yoti retorna VERIFIED */
  onComplianceApproved: (verificationId: string) => void
}

type VerificationState = 'IDLE' | 'SCANNING' | 'VERIFIED' | 'REJECTED'

// ─── Termos interativos ───────────────────────────────────────────────────────

const TERMS = [
  {
    key:   'ip' as const,
    label: '1. Soberania Autoral 100%',
    body:  'Declaro ser o titular integral dos direitos de propriedade intelectual das mídias, lives e conteúdos PPV que disponibilizo. A Your Gaze opera unicamente como infraestrutura tecnológica de intermediação.',
  },
  {
    key:   'split' as const,
    label: '2. Governança Tributária & Repasse (85/15)',
    body:  (
      <>
        Concordo com o repasse líquido fixo de{' '}
        <strong className="text-amber-400">85% sobre as vendas brutas</strong> e a taxa
        operacional fixa de 15% da plataforma, com precificação e liquidação ancoradas em
        Dólar Americano (USD&nbsp;$).
      </>
    ),
  },
  {
    key:   'kyc' as const,
    label: '3. Paridade Biométrica & Antifraude',
    body:  'Estou ciente de que saques em USD ($) só serão processados para conta bancária titular (Pessoa Física ou CNPJ próprio) perfeitamente coincidente com a biometria autenticada via Yoti. Intermediários ou terceiros são bloqueados.',
  },
] as const

type TermKey = typeof TERMS[number]['key']

// ─── YotiComplianceStep ───────────────────────────────────────────────────────

export const YotiComplianceStep: React.FC<YotiComplianceProps> = ({
  makerHandle = '@novoMaker',
  onComplianceApproved,
}) => {
  const [accepted, setAccepted] = useState<Record<TermKey, boolean>>({
    ip: false, split: false, kyc: false,
  })
  const [verifyState, setVerifyState] = useState<VerificationState>('IDLE')

  const allTermsAccepted = Object.values(accepted).every(Boolean)

  function toggle(key: TermKey) {
    setAccepted((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleStartYotiScan = () => {
    if (!allTermsAccepted) return
    setVerifyState('SCANNING')

    // Simulação E2E de latência do Webhook Yoti Biometrics (2.5 s)
    window.setTimeout(() => {
      setVerifyState('VERIFIED')
      window.setTimeout(() => {
        onComplianceApproved('yoti-auth-kyc-99482-br')
      }, 1200)
    }, 2500)
  }

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-amber-500/30 bg-slate-950 p-8 text-slate-100 shadow-[0_0_40px_rgba(10,25,47,0.9)]">

      {/* ── Cabeçalho Institucional ──────────────────────────────────────── */}
      <div className="mb-6 border-b border-slate-800 pb-5 text-center">
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
      </div>

      {/* ── Termos Interativos ───────────────────────────────────────────── */}
      <div className="mb-8 space-y-4">
        {TERMS.map((term) => (
          <label
            key={term.key}
            className="flex cursor-pointer items-start gap-3.5 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 transition-colors hover:border-amber-500/40"
          >
            <input
              type="checkbox"
              checked={accepted[term.key]}
              onChange={() => toggle(term.key)}
              className="mt-1 size-5 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-400"
            />
            <div className="text-xs leading-relaxed">
              <span className="mb-0.5 block text-sm font-bold text-slate-200">
                {term.label}
              </span>
              <span className="text-slate-400">{term.body}</span>
            </div>
          </label>
        ))}
      </div>

      {/* ── Seção de Ação Biométrica Yoti ───────────────────────────────── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">

        {verifyState === 'IDLE' && (
          <>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-300">
              <span className="size-2 rounded-full bg-amber-400" />
              Gateway Biométrico Yoti Pronto
            </div>

            <p className="mx-auto mb-5 max-w-md text-xs text-slate-400">
              Ao iniciar a verificação, validaremos sua identidade por reconhecimento facial
              documental para liberar sua conta soberana{' '}
              <strong className="text-amber-400">{makerHandle}</strong>.
            </p>

            <button
              type="button"
              onClick={handleStartYotiScan}
              disabled={!allTermsAccepted}
              className={`w-full rounded-xl px-8 py-4 text-sm font-bold shadow-lg transition-all sm:w-auto ${
                allTermsAccepted
                  ? 'cursor-pointer bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-amber-500/20 hover:scale-[1.02]'
                  : 'cursor-not-allowed border border-slate-700 bg-slate-800 text-slate-500'
              }`}
            >
              {allTermsAccepted
                ? '🔐 Iniciar Autenticação Biométrica (Yoti)'
                : '⚠️ Aceite as 3 Diretrizes Acima'}
            </button>
          </>
        )}

        {verifyState === 'SCANNING' && (
          <div className="flex flex-col items-center py-6">
            <div className="mb-4 size-12 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
            <h3 className="font-serif text-lg font-bold text-amber-400">
              Autenticando via Yoti Secure Server...
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Cruzando dados documentais com criptografia de ponta a ponta.
            </p>
          </div>
        )}

        {verifyState === 'VERIFIED' && (
          <div className="flex flex-col items-center py-6 animate-fade-in">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20 text-2xl font-bold text-emerald-400">
              ✓
            </div>
            <h3 className="font-serif text-lg font-bold text-white">
              Identidade Soberana Confirmada!
            </h3>
            <p className="mt-1 text-xs font-semibold text-emerald-400">
              KYC Biométrico Ativo · Saques em USD ($) Liberados · Repasse 85%
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
