'use client'

import { useState } from 'react'
import { ScanFace, ShieldCheck, Check, Loader2 } from 'lucide-react'
import { FullLogo } from '@/components/brand/full-logo'
import { useApp } from '@/components/app-context'
import { interesses, nacionalidades } from '@/lib/data'
import { cn } from '@/lib/utils'

const fieldCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold focus:ring-1 focus:ring-gold'
const labelCls = 'mb-1.5 block text-xs font-medium text-muted-foreground'

export function Onboarding() {
  const { accountType, completeOnboarding } = useApp()
  const isMaker = accountType === 'maker'
  const [step, setStep] = useState<0 | 1 | 2>(0)

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex flex-col items-center gap-2">
          <FullLogo width={150} />
          <p className="text-sm font-medium text-navy">
            {isMaker ? 'Cadastro de Maker' : 'Cadastro de Espectador'}
          </p>
        </div>

        <Steps step={step} isMaker={isMaker} />

        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          {step === 0 && <KycForm isMaker={isMaker} onNext={() => setStep(1)} />}
          {step === 1 && <FaceIdStep onNext={() => setStep(2)} />}
          {step === 2 && <TermsStep onFinish={completeOnboarding} />}
        </div>
      </div>
    </div>
  )
}

function Steps({ step, isMaker }: { step: number; isMaker: boolean }) {
  const labels = ['Ficha KYC', 'Reconhecimento', isMaker ? 'Termos & Banco' : 'Termos de Uso']
  return (
    <div className="flex items-center justify-center gap-2">
      {labels.map((l, i) => (
        <div key={l} className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
              i <= step ? 'bg-gold text-navy' : 'bg-secondary text-muted-foreground',
            )}
          >
            {i < step ? <Check className="h-4 w-4" /> : i + 1}
          </div>
          <span
            className={cn(
              'hidden text-xs sm:block',
              i <= step ? 'text-navy' : 'text-muted-foreground',
            )}
          >
            {l}
          </span>
          {i < labels.length - 1 && <span className="h-px w-4 bg-border" />}
        </div>
      ))}
    </div>
  )
}

function KycForm({ isMaker, onNext }: { isMaker: boolean; onNext: () => void }) {
  const [age, setAge] = useState('')
  const [interest, setInterest] = useState<string[]>([])
  const isAdult = Number(age) >= 18
  const ageInvalid = age !== '' && !isAdult

  const toggle = (i: string) =>
    setInterest((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]))

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (isAdult) onNext()
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Nome completo</label>
          <input required className={fieldCls} placeholder="Seu nome" />
        </div>
        <div>
          <label className={labelCls}>Idade</label>
          <input
            required
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className={cn(fieldCls, ageInvalid && 'border-destructive focus:border-destructive')}
            placeholder="18+"
          />
          {ageInvalid && (
            <p className="mt-1 text-xs text-destructive">É obrigatório ter mais de 18 anos.</p>
          )}
        </div>
        <div>
          <label className={labelCls}>CPF / ID Nacional</label>
          <input required className={fieldCls} placeholder="000.000.000-00" />
        </div>
        <div>
          <label className={labelCls}>Telefone</label>
          <input required className={fieldCls} placeholder="(00) 00000-0000" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Endereço</label>
          <input required className={fieldCls} placeholder="Rua, número, cidade" />
        </div>
        <div>
          <label className={labelCls}>E-mail</label>
          <input required type="email" className={fieldCls} placeholder="voce@email.com" />
        </div>
        <div>
          <label className={labelCls}>Nacionalidade</label>
          <select required className={fieldCls} defaultValue="">
            <option value="" disabled>
              Selecione
            </option>
            {nacionalidades.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Interesses</label>
        <div className="flex flex-wrap gap-2">
          {interesses.map((i) => (
            <button
              type="button"
              key={i}
              onClick={() => toggle(i)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                interest.includes(i)
                  ? 'border-gold bg-gold/15 text-navy'
                  : 'border-border text-muted-foreground hover:border-gold',
              )}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      {isMaker && (
        <div className="rounded-xl border border-gold/40 bg-gold/5 p-4">
          <p className="mb-3 text-sm font-semibold text-navy">Dados Bancários e Fiscais</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Banco</label>
              <input required className={fieldCls} placeholder="Banco / IBAN" />
            </div>
            <div>
              <label className={labelCls}>Conta para repasse</label>
              <input required className={fieldCls} placeholder="Agência / Conta" />
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="mt-2 rounded-xl bg-navy py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Continuar
      </button>
    </form>
  )
}

function FaceIdStep({ onNext }: { onNext: () => void }) {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'done'>('idle')

  const scan = () => {
    setStatus('scanning')
    setTimeout(() => setStatus('done'), 2200)
  }

  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      <div
        className={cn(
          'flex h-32 w-32 items-center justify-center rounded-full border-2',
          status === 'done' ? 'border-gold bg-gold/10' : 'border-dashed border-navy/40',
        )}
      >
        {status === 'scanning' ? (
          <Loader2 className="h-12 w-12 animate-spin text-gold" />
        ) : status === 'done' ? (
          <Check className="h-14 w-14 text-gold" />
        ) : (
          <ScanFace className="h-14 w-14 text-navy" />
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-navy">Reconhecimento Facial</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {status === 'idle' && 'Validamos que você é uma pessoa real (anti-bot).'}
          {status === 'scanning' && 'Analisando o rosto...'}
          {status === 'done' && 'Identidade verificada com sucesso.'}
        </p>
      </div>
      {status === 'done' ? (
        <button
          onClick={onNext}
          className="rounded-xl bg-navy px-8 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Continuar
        </button>
      ) : (
        <button
          onClick={scan}
          disabled={status === 'scanning'}
          className="rounded-xl bg-gold px-8 py-3 text-sm font-semibold text-navy hover:opacity-90 disabled:opacity-50"
        >
          {status === 'scanning' ? 'Escaneando...' : 'Iniciar verificação'}
        </button>
      )}
    </div>
  )
}

function TermsStep({ onFinish }: { onFinish: () => void }) {
  const [accepted, setAccepted] = useState(false)
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
        <p className="text-sm text-muted-foreground">
          Confirmo que tenho mais de 18 anos e que os dados fornecidos são verdadeiros.
          Li e aceito os Termos de Uso e a Política de Privacidade da YOUR GAZE.
        </p>
      </div>
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="h-4 w-4 accent-[#D4AF37]"
        />
        <span className="text-sm text-navy">Aceito os Termos de Uso</span>
      </label>
      <button
        onClick={onFinish}
        disabled={!accepted}
        className="rounded-xl bg-gold py-3 text-sm font-semibold text-navy transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Finalizar cadastro
      </button>
    </div>
  )
}
