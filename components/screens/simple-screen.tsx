'use client'

import { useState } from 'react'
import { KeyRound, Lock, LifeBuoy, Mail, MessageSquareText } from 'lucide-react'
import { useApp } from '@/components/app-context'
import { useDict } from '@/lib/locale-context'

export function SettingsScreen() {
  const { enterAdmin, isAdminEligible } = useApp()
  const t = useDict()
  const [showToken, setShowToken] = useState(false)
  const [token, setToken] = useState('')
  const [error, setError] = useState(false)

  const menuItems = [
    t.settings_support.settings_conta,
    t.settings_support.settings_notificacoes,
    t.settings_support.settings_privacidade,
    t.settings_support.settings_idioma,
  ]

  const submit = () => {
    const ok = enterAdmin(token)
    if (!ok) setError(true)
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h2 className="mb-6 font-heading text-2xl text-navy">{t.settings_support.settings_title}</h2>

      <div className="flex flex-col gap-3">
        {menuItems.map((s) => (
          <button key={s} className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4 text-left text-sm text-navy hover:border-gold">
            {s}
            <span className="text-muted-foreground">›</span>
          </button>
        ))}
      </div>

      {/* Acesso ao Backoffice — visível somente para e-mail admin autorizado */}
      {isAdminEligible && (
        <div className="mt-10 border-t border-dashed border-border pt-6">
          {!showToken ? (
            <button
              onClick={() => setShowToken(true)}
              className="flex items-center gap-2 text-xs text-muted-foreground/60 hover:text-navy"
            >
              <Lock className="size-3.5" /> {t.settings_support.settings_backoffice}
            </button>
          ) : (
            <div className="rounded-xl border border-navy/20 bg-secondary/40 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-navy">
                <KeyRound className="size-4 text-gold" /> {t.settings_support.settings_token_titulo}
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value)
                    setError(false)
                  }}
                  placeholder={t.settings_support.settings_token_ph}
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
                />
                <button onClick={submit} className="rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
                  {t.settings_support.settings_entrar}
                </button>
              </div>
              {error && <p className="mt-2 text-xs text-destructive">{t.settings_support.settings_token_invalido}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function SupportScreen() {
  const t = useDict()

  const items = [
    { icon: MessageSquareText, title: t.settings_support.support_chat,      desc: t.settings_support.support_chat_desc },
    { icon: Mail,              title: t.settings_support.support_email,     desc: 'suporte@yourgaze.br' },
    { icon: LifeBuoy,          title: t.settings_support.support_central,   desc: t.settings_support.support_central_desc },
    { icon: KeyRound,          title: t.settings_support.support_seguranca, desc: t.settings_support.support_seguranca_desc },
  ]

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h2 className="mb-6 font-heading text-2xl text-navy">{t.settings_support.support_title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.title} className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
              <span className="flex size-10 items-center justify-center rounded-lg bg-gold/15 text-gold">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-navy">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
