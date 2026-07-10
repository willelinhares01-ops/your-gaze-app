'use client'

import { useState, useMemo } from 'react'
import { Loader2, ArrowLeft } from 'lucide-react'
import { FullLogo } from '@/components/brand/full-logo'
import { useApp, type AccountType } from '@/components/app-context'
import { useDict } from '@/lib/locale-context'
import { supabase } from '@/lib/supabase'

const fieldCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold focus:ring-1 focus:ring-gold'
const labelCls = 'mb-1.5 block text-xs font-medium text-muted-foreground'

export function Login() {
  const { completeLogin, startOnboarding, goToLanding } = useApp()
  const t = useDict()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Força de senha — visual apenas no login (não bloqueia submit)
  const pwStrength = useMemo(() => {
    if (!password) return 0
    let s = 0
    if (password.length >= 8) s++
    if (/[A-Z]/.test(password)) s++
    if (/[0-9]/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return s
  }, [password])
  const strengthMeta = [
    { label: '',                      color: 'bg-border'        },
    { label: t.auth.senha_fraca,      color: 'bg-destructive'   },
    { label: t.auth.senha_razoavel,   color: 'bg-amber-400'     },
    { label: t.auth.senha_boa,        color: 'bg-blue-400'      },
    { label: t.auth.senha_forte,      color: 'bg-emerald-500'   },
  ][pwStrength]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      console.error('ERRO REAL [signInWithPassword]:', authError)
      setError(
        authError.message === 'Invalid login credentials'
          ? t.auth.credenciais_invalidas
          : authError.message,
      )
      setLoading(false)
      return
    }

    let role: AccountType | null = null
    try {
      const userId = data.user?.id
      if (userId) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single()

        if (profileError) {
          console.warn('Aviso [profiles select]:', profileError.message)
        } else {
          const raw = (profile as { role?: string } | null)?.role
          if (raw === 'espectador' || raw === 'maker') role = raw
        }
      }
    } catch (err) {
      console.warn('Aviso [busca de role]:', err)
    }

    completeLogin(role)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Cabeçalho */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <FullLogo width={150} />
          <p className="text-sm font-medium text-navy">{t.auth.entrar_conta}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          {/* E-mail */}
          <div>
            <label className={labelCls}>{t.auth.email}</label>
            <input
              required
              type="email"
              autoComplete="email"
              className={fieldCls}
              placeholder={t.auth.email_placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Senha */}
          <div>
            <label className={labelCls}>{t.auth.senha}</label>
            <input
              required
              type="password"
              autoComplete="current-password"
              minLength={8}
              className={fieldCls}
              placeholder={t.auth.senha_placeholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {/* Indicador visual de força — informativo, não bloqueia login */}
            {password.length > 0 && (
              <div className="mt-1.5 flex items-center gap-2">
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
            )}
          </div>

          {/* Mensagem de erro */}
          {error && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          {/* Botão principal */}
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-navy py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.auth.entrando}
              </span>
            ) : (
              t.auth.login
            )}
          </button>

          {/* Links de cadastro */}
          <div className="flex flex-col items-center gap-2 pt-1 text-xs text-muted-foreground">
            <span>{t.auth.ainda_sem_conta}</span>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
              <button
                type="button"
                onClick={() => startOnboarding('espectador')}
                className="font-semibold text-navy hover:underline"
              >
                {t.auth.cadastrar_espectador}
              </button>
              <span aria-hidden>·</span>
              <button
                type="button"
                onClick={() => startOnboarding('maker')}
                className="font-semibold text-navy hover:underline"
              >
                {t.auth.cadastrar_maker}
              </button>
            </div>
          </div>
        </form>

        {/* Voltar */}
        <button
          type="button"
          onClick={goToLanding}
          className="mt-5 flex w-full items-center justify-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-navy"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t.auth.voltar_inicial}
        </button>
      </div>
    </div>
  )
}
