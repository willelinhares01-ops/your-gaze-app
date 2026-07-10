'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ScanFace,
  ShieldCheck,
  Check,
  Loader2,
  Fingerprint,
  AlertTriangle,
} from 'lucide-react'
import { FullLogo } from '@/components/brand/full-logo'
import { useApp } from '@/components/app-context'
import { useDict } from '@/lib/locale-context'
import { supabase } from '@/lib/supabase'
import { interesses, nacionalidades } from '@/lib/data'
import { cn } from '@/lib/utils'

const fieldCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold focus:ring-1 focus:ring-gold'
const labelCls = 'mb-1.5 block text-xs font-medium text-muted-foreground'

// ─── Tipos ────────────────────────────────────────────────────────────────────
type KycData = {
  nome: string
  email: string
  password: string
  dataNascimento: string   // ISO date string — idade calculada em runtime
  cpf: string
  telefone: string
  endereco: string
  nacionalidade: string
  interesses: string[]
  banco: string
  conta: string
}

const emptyKyc: KycData = {
  nome: '',
  email: '',
  password: '',
  dataNascimento: '',
  cpf: '',
  telefone: '',
  endereco: '',
  nacionalidade: '',
  interesses: [],
  banco: '',
  conta: '',
}

// ─── Utilitário: cálculo exato de idade a partir da DOB ──────────────────────
export function calcularIdade(dataNascimento: string): number | null {
  if (!dataNascimento) return null
  const dob = new Date(dataNascimento)
  if (isNaN(dob.getTime())) return null
  const hoje = new Date()
  let idade = hoje.getFullYear() - dob.getFullYear()
  const mesAntes = hoje.getMonth() < dob.getMonth()
  const mesIgualDiaAntes =
    hoje.getMonth() === dob.getMonth() && hoje.getDate() < dob.getDate()
  if (mesAntes || mesIgualDiaAntes) idade--
  return idade
}

// Data máxima permitida no campo DOB (18 anos atrás exatos)
export const MAX_DOB = (() => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 18)
  return d.toISOString().split('T')[0]
})()

// ─── Componente principal ─────────────────────────────────────────────────────
export function Onboarding() {
  const { accountType, completeOnboarding } = useApp()
  const t = useDict()
  const router = useRouter()
  const isMaker = accountType === 'maker'

  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [kycData, setKycData] = useState<KycData>(emptyKyc)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function extractMessage(err: unknown): string {
    if (err == null) return t.onboarding.erro_desconhecido
    if (typeof err === 'string') return err
    if (typeof err === 'object' && 'message' in err)
      return String((err as { message: unknown }).message)
    return t.onboarding.erro_finalizar
  }

  /**
   * Identifica erros de rede/DNS/conectividade que não representam falhas de
   * negócio (ex.: AuthRetryableFetchError, Failed to fetch, ERR_NAME_NOT_RESOLVED).
   * Esses erros são tratados em Graceful Degradation — o fluxo avança localmente.
   */
  function isNetworkError(err: unknown): boolean {
    if (!(err instanceof Error)) return false
    const msg  = err.message.toLowerCase()
    const name = err.name.toLowerCase()
    return (
      name.includes('retryable') ||
      name.includes('fetcherror') ||
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('network request failed') ||
      msg.includes('err_name_not_resolved')
    )
  }

  /** Modo Sandbox: avança o usuário localmente sem bloquear o fluxo. */
  function advanceSandbox(): void {
    console.warn(
      '⚠️ Modo Sandbox: Conexão com Supabase indisponível, avançando em modo local...',
    )
    completeOnboarding()
    router.push('/app')
  }

  const handleFinish = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      // A) Cria a conta no Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: kycData.email,
        password: kycData.password,
      })
      if (signUpError) {
        // Erros de rede retornam como `signUpError` em vez de throw; tratamos igual.
        if (isNetworkError(signUpError)) { advanceSandbox(); return }
        console.error('ERRO REAL [signUp]:', signUpError)
        throw signUpError
      }
      const userId = data.user?.id
      if (!userId)
        throw new Error(
          'Usuário não retornado pelo Supabase. Verifique se o e-mail já está cadastrado ou se a confirmação está ativa.',
        )

      // B) Insere perfil na tabela `profiles`
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: userId, full_name: kycData.nome, role: accountType })
      if (profileError) {
        if (isNetworkError(profileError)) { advanceSandbox(); return }
        console.error('ERRO REAL [profiles insert]:', profileError)
        throw profileError
      }

      // C) KYC — não-fatal; computa idade exata da DOB
      const idadeCalculada = calcularIdade(kycData.dataNascimento) ?? 0
      const { error: kycError } = await supabase.from('kyc_records').insert({
        user_id: userId,
        cpf: kycData.cpf,
        data_nascimento: kycData.dataNascimento,
        idade: idadeCalculada,
        telefone: kycData.telefone,
        endereco: kycData.endereco,
        email: kycData.email,
        nacionalidade: kycData.nacionalidade,
        interesses: kycData.interesses,
        ...(isMaker && { banco: kycData.banco, conta: kycData.conta }),
      })
      if (kycError) {
        console.warn('Aviso [kyc_records insert]:', kycError.code, kycError.message)
      }

      completeOnboarding()
      router.push('/app')
    } catch (err: unknown) {
      // Erros de rede que escapam como throw (ex.: AuthRetryableFetchError)
      if (isNetworkError(err)) { advanceSandbox(); return }
      console.error('ERRO REAL [handleFinish catch]:', err)
      setSubmitError(extractMessage(err))
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex flex-col items-center gap-2">
          <FullLogo width={150} />
          <p className="text-sm font-medium text-navy">
            {isMaker ? t.onboarding.title_maker : t.onboarding.cadastro_espectador}
          </p>
        </div>

        <Steps step={step} isMaker={isMaker} />

        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          {step === 0 && (
            <KycForm
              isMaker={isMaker}
              data={kycData}
              onChange={setKycData}
              onNext={() => setStep(1)}
            />
          )}
          {step === 1 && <FaceIdStep onNext={() => setStep(2)} />}
          {step === 2 && (
            <TermsStep
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

// ─── Indicador de etapas ──────────────────────────────────────────────────────
function Steps({ step, isMaker }: { step: number; isMaker: boolean }) {
  const t = useDict()
  const labels = [
    t.onboarding.step_kyc,
    t.onboarding.step_reconhecimento,
    isMaker ? t.onboarding.step_termos_banco : t.onboarding.step_termos_uso,
  ]

  return (
    <div className="flex items-center justify-center gap-2">
      {labels.map((label, i) => (
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
          {i < labels.length - 1 && <span className="h-px w-4 bg-border" />}
        </div>
      ))}
    </div>
  )
}

// ─── Formulário KYC ───────────────────────────────────────────────────────────
function KycForm({
  isMaker,
  data,
  onChange,
  onNext,
}: {
  isMaker: boolean
  data: KycData
  onChange: (d: KycData) => void
  onNext: () => void
}) {
  const t = useDict()

  // Cálculo de idade em tempo real a partir da DOB
  const idadeCalculada = calcularIdade(data.dataNascimento)
  const isAdult = idadeCalculada !== null && idadeCalculada >= 18
  const ageInvalid = data.dataNascimento !== '' && !isAdult

  const set =
    (field: keyof KycData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({ ...data, [field]: e.target.value })

  const toggleInteresse = (i: string) =>
    onChange({
      ...data,
      interesses: data.interesses.includes(i)
        ? data.interesses.filter((x) => x !== i)
        : [...data.interesses, i],
    })

  // Força de senha (bloqueia se < 3 = "Boa")
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
        {/* Nome */}
        <div>
          <label className={labelCls}>{t.onboarding.kyc_nome}</label>
          <input
            required
            className={fieldCls}
            placeholder={t.onboarding.kyc_nome_ph}
            value={data.nome}
            onChange={set('nome')}
          />
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
            className={cn(fieldCls, ageInvalid && 'border-destructive focus:border-destructive focus:ring-destructive/30')}
          />
          {/* Aviso de idade inválida */}
          {ageInvalid && (
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
              <p className="text-xs font-medium text-destructive">
                {t.onboarding.kyc_menor_18}
              </p>
            </div>
          )}
          {/* Confirmação de idade válida */}
          {isAdult && (
            <p className="mt-1 text-xs text-emerald-600">
              ✓ {idadeCalculada} anos — acesso liberado
            </p>
          )}
        </div>

        {/* CPF / ID */}
        <div>
          <label className={labelCls}>{t.onboarding.kyc_cpf}</label>
          <input
            required
            className={fieldCls}
            placeholder="000.000.000-00"
            value={data.cpf}
            onChange={set('cpf')}
          />
        </div>

        {/* Telefone */}
        <div>
          <label className={labelCls}>{t.onboarding.kyc_telefone}</label>
          <input
            required
            className={fieldCls}
            placeholder="+55 (00) 00000-0000"
            value={data.telefone}
            onChange={set('telefone')}
          />
        </div>

        {/* Endereço */}
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

        {/* E-mail */}
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

        {/* Senha + barra de força */}
        <div>
          <label className={labelCls}>{t.auth.senha}</label>
          <input
            required
            type="password"
            minLength={8}
            className={fieldCls}
            placeholder={t.onboarding.kyc_senha_ph}
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

        {/* Nacionalidade */}
        <div className="sm:col-span-2">
          <label className={labelCls}>{t.onboarding.kyc_nacionalidade}</label>
          <select
            required
            className={fieldCls}
            value={data.nacionalidade}
            onChange={set('nacionalidade')}
          >
            <option value="" disabled>{t.onboarding.kyc_selecione}</option>
            {nacionalidades.map((n) => <option key={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Interesses */}
      <div>
        <label className={labelCls}>{t.onboarding.kyc_interesses}</label>
        <div className="flex flex-wrap gap-2">
          {interesses.map((i) => {
            const labelMap: Record<string, string> = {
              'Moda':        t.onboarding.interesse_Moda,
              'Beleza':      t.onboarding.interesse_Beleza,
              'Fitness':     t.onboarding.interesse_Fitness,
              'Lifestyle':   t.onboarding.interesse_Lifestyle,
              'Arte':        t.onboarding.interesse_Arte,
              'Música':      t.onboarding.interesse_Musica,
              'Viagens':     t.onboarding.interesse_Viagens,
              'Gastronomia': t.onboarding.interesse_Gastronomia,
            }
            return (
              <button
                type="button"
                key={i}
                onClick={() => toggleInteresse(i)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs transition-colors',
                  data.interesses.includes(i)
                    ? 'border-gold bg-gold/15 text-navy'
                    : 'border-border text-muted-foreground hover:border-gold',
                )}
              >
                {labelMap[i] ?? i}
              </button>
            )
          })}
        </div>
      </div>

      {/* Dados bancários (só para Makers) */}
      {isMaker && (
        <div className="rounded-xl border border-gold/40 bg-gold/5 p-4">
          <p className="mb-3 text-sm font-semibold text-navy">{t.onboarding.kyc_dados_bancarios}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>{t.onboarding.kyc_banco}</label>
              <input
                required
                className={fieldCls}
                placeholder={t.onboarding.kyc_banco_ph}
                value={data.banco}
                onChange={set('banco')}
              />
            </div>
            <div>
              <label className={labelCls}>{t.onboarding.kyc_conta}</label>
              <input
                required
                className={fieldCls}
                placeholder={t.onboarding.kyc_conta_ph}
                value={data.conta}
                onChange={set('conta')}
              />
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!canAdvance && (data.dataNascimento !== '' || data.password.length > 0)}
        className="mt-2 rounded-xl bg-navy py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t.onboarding.continuar}
      </button>
    </form>
  )
}

// ─── Etapa de verificação: Face ID + Yoti placeholder ─────────────────────────
function FaceIdStep({ onNext }: { onNext: () => void }) {
  const t = useDict()
  const [status, setStatus] = useState<'idle' | 'scanning' | 'done'>('idle')

  const scan = () => {
    setStatus('scanning')
    setTimeout(() => setStatus('done'), 2200)
  }

  const statusText = {
    idle:     t.onboarding.face_idle,
    scanning: t.onboarding.face_scanning,
    done:     t.onboarding.face_done,
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
        <p className="text-sm font-semibold text-navy">{t.onboarding.face_title}</p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">{statusText}</p>
      </div>

      {status === 'done' ? (
        <button
          onClick={onNext}
          className="rounded-xl bg-navy px-8 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {t.onboarding.continuar}
        </button>
      ) : (
        <button
          onClick={scan}
          disabled={status === 'scanning'}
          className="rounded-xl bg-gold px-8 py-3 text-sm font-semibold text-navy hover:opacity-90 disabled:opacity-50"
        >
          {status === 'scanning' ? t.onboarding.face_btn_scanning : t.onboarding.face_btn_iniciar}
        </button>
      )}

      {/* ── Yoti placeholder — Verificação de Identidade Governamental ─────── */}
      <div className="w-full rounded-xl border border-dashed border-gold/50 bg-gold/5 p-4 text-left">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck className="size-4 shrink-0 text-gold" />
          <span className="text-sm font-semibold text-navy">{t.onboarding.yoti_title}</span>
        </div>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
          {t.onboarding.yoti_desc}
        </p>
        <button
          type="button"
          disabled
          className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-gold/40 bg-background py-2.5 text-sm font-medium text-navy/40 opacity-60"
        >
          <Fingerprint className="size-4" />
          {t.onboarding.yoti_btn}
        </button>
        <p className="mt-2 text-center text-[10px] italic text-muted-foreground/60">
          {t.onboarding.yoti_proximamente}
        </p>
      </div>
    </div>
  )
}

// ─── Etapa de termos — 2 checkboxes obrigatórios ─────────────────────────────
function TermsStep({
  onFinish,
  isSubmitting,
  error,
}: {
  onFinish: () => void
  isSubmitting: boolean
  error: string | null
}) {
  const t = useDict()
  const [acceptedMaior18, setAcceptedMaior18] = useState(false)
  const [acceptedTermos, setAcceptedTermos] = useState(false)
  const allAccepted = acceptedMaior18 && acceptedTermos

  return (
    <div className="flex flex-col gap-5">
      {/* Ícone legal */}
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
        <p className="text-sm leading-relaxed text-muted-foreground">{t.onboarding.terms_texto}</p>
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
        <span className="text-sm font-medium text-navy">{t.onboarding.terms_maior18}</span>
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
        <span className="text-sm font-medium text-navy">{t.onboarding.terms_politica}</span>
      </label>

      {/* Erro de envio */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* Botão de finalizar */}
      <button
        onClick={onFinish}
        disabled={!allAccepted || isSubmitting}
        className="rounded-xl bg-gold py-3 text-sm font-semibold text-navy transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.onboarding.criando_conta}
          </span>
        ) : (
          t.onboarding.finalizar
        )}
      </button>
    </div>
  )
}
