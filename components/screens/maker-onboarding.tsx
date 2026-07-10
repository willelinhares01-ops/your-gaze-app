'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ScanFace,
  ShieldCheck,
  Check,
  Loader2,
  FileText,
  CreditCard,
  Fingerprint,
  AlertTriangle,
} from 'lucide-react'
import { FullLogo } from '@/components/brand/full-logo'
import { YotiComplianceStep } from '@/components/maker-studio/YotiComplianceStep'
import { useApp } from '@/components/app-context'
import { useDict } from '@/lib/locale-context'
import { supabase } from '@/lib/supabase'
import { nacionalidades } from '@/lib/data'
import { cn } from '@/lib/utils'
import { calcularIdade, MAX_DOB } from '@/components/screens/onboarding'

// ─── Estilos compartilhados ──────────────────────────────────────────────────
const fieldCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold focus:ring-1 focus:ring-gold'
const labelCls = 'mb-1.5 block text-xs font-medium text-muted-foreground'

// ─── Tipos ───────────────────────────────────────────────────────────────────
type DocTipo = 'cpf' | 'passaporte'

type MakerData = {
  nome: string
  email: string
  password: string
  dataNascimento: string  // ISO date — idade calculada em runtime
  telefone: string
  endereco: string
  nacionalidade: string
  docTipo: DocTipo | ''
  docNumero: string
  banco: string
  conta: string
}

const emptyData: MakerData = {
  nome: '',
  email: '',
  password: '',
  dataNascimento: '',
  telefone: '',
  endereco: '',
  nacionalidade: '',
  docTipo: '',
  docNumero: '',
  banco: '',
  conta: '',
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function MakerOnboarding() {
  const { completeOnboarding } = useApp()
  const t = useDict()
  const router = useRouter()

  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)
  const [data, setData] = useState<MakerData>(emptyData)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function extractMessage(err: unknown): string {
    if (err == null) return t.onboarding.erro_desconhecido
    if (typeof err === 'string') return err
    if (typeof err === 'object' && 'message' in err)
      return String((err as { message: unknown }).message)
    return t.onboarding.erro_finalizar
  }

  const handleFinish = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // A) Cria a conta no Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })
      if (signUpError) {
        console.error('ERRO REAL [Maker signUp]:', signUpError)
        throw signUpError
      }
      const userId = authData.user?.id
      if (!userId)
        throw new Error(
          'Usuário não retornado pelo Supabase. Verifique se o e-mail já está cadastrado.',
        )

      // B) Grava perfil com role estritamente 'maker'
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: userId, full_name: data.nome, role: 'maker' })
      if (profileError) {
        console.error('ERRO REAL [Maker profiles insert]:', profileError)
        throw profileError
      }

      // C) KYC antifraude — não-fatal; computa idade da DOB
      const idadeCalculada = calcularIdade(data.dataNascimento) ?? 0
      const { error: kycError } = await supabase.from('kyc_records').insert({
        user_id: userId,
        email: data.email,
        data_nascimento: data.dataNascimento,
        idade: idadeCalculada,
        telefone: data.telefone,
        endereco: data.endereco,
        nacionalidade: data.nacionalidade,
        doc_tipo: data.docTipo,
        doc_numero: data.docNumero,
        banco: data.banco,
        conta: data.conta,
        interesses: [],
      })
      if (kycError) {
        console.warn('Aviso [Maker kyc_records]:', kycError.code, kycError.message)
      }

      completeOnboarding()
      router.push('/dashboard')
    } catch (err: unknown) {
      console.error('ERRO REAL [Maker handleFinish]:', err)
      setSubmitError(extractMessage(err))
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex flex-col items-center gap-2">
          <FullLogo width={150} />
          <p className="text-sm font-medium text-navy">{t.maker_onboarding.cadastro}</p>
        </div>

        <StepBar step={step} />

        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          {step === 0 && (
            <BasicDataStep data={data} onChange={setData} onNext={() => setStep(1)} />
          )}
          {step === 1 && (
            <Antifraude data={data} onChange={setData} onNext={() => setStep(2)} />
          )}
          {step === 2 && (
            <YotiComplianceStep
              makerHandle={
                data.nome
                  ? `@${data.nome.toLowerCase().replace(/\s+/g, '').slice(0, 20)}`
                  : '@novoMaker'
              }
              onComplianceApproved={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <TermsAndBankStep
              data={data}
              onChange={setData}
              onFinish={handleFinish}
              isSubmitting={isSubmitting}
              error={submitError}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Indicador de progresso ──────────────────────────────────────────────────
function StepBar({ step }: { step: number }) {
  const t = useDict()
  const stepLabels = [
    t.maker_onboarding.step_dados,
    t.maker_onboarding.step_antifraude,
    t.maker_onboarding.step_reconhecimento,
    t.maker_onboarding.step_termos,
  ]

  return (
    <div className="flex items-center justify-center gap-2">
      {stepLabels.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
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
            {label}
          </span>
          {i < stepLabels.length - 1 && <span className="h-px w-4 bg-border" />}
        </div>
      ))}
    </div>
  )
}

// ─── Etapa 0: Dados Básicos com DOB real-time ─────────────────────────────────
function BasicDataStep({
  data,
  onChange,
  onNext,
}: {
  data: MakerData
  onChange: (d: MakerData) => void
  onNext: () => void
}) {
  const t = useDict()

  // Cálculo de idade em tempo real
  const idadeCalculada = calcularIdade(data.dataNascimento)
  const isAdult = idadeCalculada !== null && idadeCalculada >= 18
  const ageInvalid = data.dataNascimento !== '' && !isAdult

  const set =
    (field: keyof MakerData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({ ...data, [field]: e.target.value })

  const pwStrength = useMemo(() => {
    const pw = data.password
    if (!pw) return 0
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
  }, [data.password])

  const strengthMeta = [
    { label: '',                    color: 'bg-border'      },
    { label: t.auth.senha_fraca,    color: 'bg-destructive' },
    { label: t.auth.senha_razoavel, color: 'bg-amber-400'   },
    { label: t.auth.senha_boa,      color: 'bg-blue-400'    },
    { label: t.auth.senha_forte,    color: 'bg-emerald-500' },
  ][pwStrength]

  const pwValid = pwStrength >= 3
  const canAdvance = isAdult && pwValid

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (canAdvance) onNext()
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>{t.maker_onboarding.nome_label}</label>
          <input
            required
            className={fieldCls}
            placeholder={t.maker_onboarding.nome_ph}
            value={data.nome}
            onChange={set('nome')}
          />
        </div>

        <div>
          <label className={labelCls}>{t.auth.email}</label>
          <input
            required
            type="email"
            className={fieldCls}
            placeholder={t.auth.email_placeholder}
            value={data.email}
            onChange={set('email')}
          />
        </div>

        <div>
          <label className={labelCls}>{t.auth.senha}</label>
          <input
            required
            type="password"
            minLength={8}
            className={fieldCls}
            placeholder={t.maker_onboarding.senha_ph}
            value={data.password}
            onChange={set('password')}
          />
          {data.password.length > 0 && (
            <div className="mt-1.5">
              <div className="flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${i <= pwStrength ? strengthMeta.color : 'bg-border'}`}
                    />
                  ))}
                </div>
                {strengthMeta.label && (
                  <span className="text-[10px] text-muted-foreground">{strengthMeta.label}</span>
                )}
              </div>
              {!pwValid && (
                <p className="mt-1 text-[10px] text-muted-foreground">{t.auth.senha_requisitos}</p>
              )}
            </div>
          )}
        </div>

        {/* Data de Nascimento — cálculo real de idade */}
        <div>
          <label className={labelCls}>{t.onboarding.kyc_nascimento}</label>
          <input
            required
            type="date"
            max={MAX_DOB}
            value={data.dataNascimento}
            onChange={set('dataNascimento')}
            className={cn(
              fieldCls,
              ageInvalid && 'border-destructive focus:border-destructive focus:ring-destructive/30',
            )}
          />
          {ageInvalid && (
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
              <p className="text-xs font-medium text-destructive">
                {t.onboarding.kyc_menor_18}
              </p>
            </div>
          )}
          {isAdult && (
            <p className="mt-1 text-xs text-emerald-600">
              ✓ {idadeCalculada} anos — acesso liberado
            </p>
          )}
        </div>

        <div>
          <label className={labelCls}>{t.onboarding.kyc_telefone}</label>
          <input
            required
            className={fieldCls}
            placeholder="(00) 00000-0000"
            value={data.telefone}
            onChange={set('telefone')}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>{t.onboarding.kyc_endereco}</label>
          <input
            required
            className={fieldCls}
            placeholder={t.onboarding.kyc_endereco_ph}
            value={data.endereco}
            onChange={set('endereco')}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>{t.onboarding.kyc_nacionalidade}</label>
          <select
            required
            className={fieldCls}
            value={data.nacionalidade}
            onChange={set('nacionalidade')}
          >
            <option value="" disabled>{t.maker_onboarding.selecione}</option>
            {nacionalidades.map((n) => <option key={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={!canAdvance && (data.dataNascimento !== '' || data.password.length > 0)}
        className="mt-2 rounded-xl bg-navy py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t.maker_onboarding.continuar}
      </button>
    </form>
  )
}

// ─── Etapa 1: Antifraude / KYC Documento ─────────────────────────────────────
function AntifraueNote() {
  const t = useDict()
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gold/40 bg-gold/5 p-4">
      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
      <p className="text-xs leading-relaxed text-muted-foreground">
        {t.maker_onboarding.antifraude_nota}
      </p>
    </div>
  )
}

function Antifraude({
  data,
  onChange,
  onNext,
}: {
  data: MakerData
  onChange: (d: MakerData) => void
  onNext: () => void
}) {
  const t = useDict()
  const set =
    (field: keyof MakerData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({ ...data, [field]: e.target.value })

  const placeholders: Record<DocTipo, string> = {
    cpf: '000.000.000-00',
    passaporte: 'AB123456',
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        onNext()
      }}
    >
      <AntifraueNote />

      <div>
        <label className={labelCls}>{t.maker_onboarding.doc_tipo}</label>
        <div className="grid grid-cols-2 gap-3">
          {(['cpf', 'passaporte'] as DocTipo[]).map((tipo) => {
            const Icon = tipo === 'cpf' ? CreditCard : FileText
            const active = data.docTipo === tipo
            const docLabel =
              tipo === 'cpf' ? t.maker_onboarding.doc_cpf : t.maker_onboarding.doc_passaporte
            return (
              <button
                key={tipo}
                type="button"
                onClick={() => onChange({ ...data, docTipo: tipo, docNumero: '' })}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors',
                  active
                    ? 'border-gold bg-gold/10 font-semibold text-navy'
                    : 'border-border text-muted-foreground hover:border-gold',
                )}
              >
                <Icon className={cn('h-5 w-5 shrink-0', active ? 'text-gold' : 'text-navy/40')} />
                {docLabel}
              </button>
            )
          })}
        </div>
      </div>

      {data.docTipo && (
        <div>
          <label className={labelCls}>
            {data.docTipo === 'cpf'
              ? t.maker_onboarding.doc_num_cpf
              : t.maker_onboarding.doc_num_passaporte}
          </label>
          <input
            required
            className={fieldCls}
            placeholder={placeholders[data.docTipo as DocTipo]}
            value={data.docNumero}
            onChange={set('docNumero')}
            minLength={data.docTipo === 'cpf' ? 11 : 6}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={!data.docTipo || !data.docNumero}
        className="rounded-xl bg-navy py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t.maker_onboarding.doc_validar}
      </button>
    </form>
  )
}

// ─── Etapa 2: Face ID + Yoti placeholder ─────────────────────────────────────
function FaceIdStep({ onNext }: { onNext: () => void }) {
  const t = useDict()
  const [status, setStatus] = useState<'idle' | 'scanning' | 'done'>('idle')

  const scan = () => {
    setStatus('scanning')
    setTimeout(() => setStatus('done'), 2200)
  }

  const statusText = {
    idle:     t.maker_onboarding.face_idle,
    scanning: t.maker_onboarding.face_scanning,
    done:     t.maker_onboarding.face_done,
  }[status]

  return (
    <div className="flex flex-col items-center gap-6 py-2 text-center">
      {/* Face scan */}
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
        <p className="text-sm font-semibold text-navy">{t.maker_onboarding.face_title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{statusText}</p>
      </div>

      {status === 'done' ? (
        <button
          onClick={onNext}
          className="rounded-xl bg-navy px-8 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {t.maker_onboarding.continuar}
        </button>
      ) : (
        <button
          onClick={scan}
          disabled={status === 'scanning'}
          className="rounded-xl bg-gold px-8 py-3 text-sm font-semibold text-navy hover:opacity-90 disabled:opacity-50"
        >
          {status === 'scanning'
            ? t.maker_onboarding.face_btn_scanning
            : t.maker_onboarding.face_btn_iniciar}
        </button>
      )}

      {/* ── Yoti placeholder — Verificação de Identidade Governamental ─────── */}
      <div className="w-full rounded-xl border border-dashed border-gold/50 bg-gold/5 p-4 text-left">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck className="size-4 shrink-0 text-gold" />
          <span className="text-sm font-semibold text-navy">{t.maker_onboarding.yoti_title}</span>
        </div>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
          {t.maker_onboarding.yoti_desc}
        </p>
        <button
          type="button"
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-gold/40 bg-background py-2.5 text-sm font-medium text-navy/40 opacity-60"
        >
          <Fingerprint className="size-4" />
          {t.maker_onboarding.yoti_btn}
        </button>
        <p className="mt-2 text-center text-[10px] italic text-muted-foreground/60">
          {t.maker_onboarding.yoti_proximamente}
        </p>
      </div>
    </div>
  )
}

// ─── Etapa 3: Termos + Dados Bancários — 2 checkboxes ────────────────────────
function TermsAndBankStep({
  data,
  onChange,
  onFinish,
  isSubmitting,
  error,
}: {
  data: MakerData
  onChange: (d: MakerData) => void
  onFinish: () => void
  isSubmitting: boolean
  error: string | null
}) {
  const t = useDict()
  const [acceptedMaior18, setAcceptedMaior18] = useState(false)
  const [acceptedTermos, setAcceptedTermos] = useState(false)
  const allAccepted = acceptedMaior18 && acceptedTermos

  const set =
    (field: keyof MakerData) => (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...data, [field]: e.target.value })

  return (
    <div className="flex flex-col gap-5">
      {/* Dados bancários */}
      <div className="rounded-xl border border-gold/40 bg-gold/5 p-4">
        <p className="mb-3 text-sm font-semibold text-navy">{t.maker_onboarding.banco_titulo}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>{t.onboarding.kyc_banco}</label>
            <input
              required
              className={fieldCls}
              placeholder={t.maker_onboarding.banco_ph}
              value={data.banco}
              onChange={set('banco')}
            />
          </div>
          <div>
            <label className={labelCls}>{t.maker_onboarding.conta_label}</label>
            <input
              required
              className={fieldCls}
              placeholder={t.maker_onboarding.conta_ph}
              value={data.conta}
              onChange={set('conta')}
            />
          </div>
        </div>
      </div>

      {/* Bloco de compliance legal */}
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
        <p className="text-sm text-muted-foreground">{t.maker_onboarding.terms_texto}</p>
      </div>

      {/* Checkbox 1: Declaração de Maioridade */}
      <label
        className={cn(
          'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
          acceptedMaior18 ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50',
        )}
      >
        <input
          type="checkbox"
          checked={acceptedMaior18}
          onChange={(e) => setAcceptedMaior18(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#D4AF37]"
        />
        <span className="text-sm font-medium text-navy">{t.maker_onboarding.terms_maior18}</span>
      </label>

      {/* Checkbox 2: Termos de Serviço + Privacidade */}
      <label
        className={cn(
          'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
          acceptedTermos ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50',
        )}
      >
        <input
          type="checkbox"
          checked={acceptedTermos}
          onChange={(e) => setAcceptedTermos(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#D4AF37]"
        />
        <span className="text-sm font-medium text-navy">{t.maker_onboarding.terms_politica}</span>
      </label>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      <button
        onClick={onFinish}
        disabled={!allAccepted || !data.banco || !data.conta || isSubmitting}
        className="rounded-xl bg-gold py-3 text-sm font-semibold text-navy transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.maker_onboarding.criando}
          </span>
        ) : (
          t.maker_onboarding.finalizar
        )}
      </button>
    </div>
  )
}
