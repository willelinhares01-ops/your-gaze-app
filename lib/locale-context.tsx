'use client'

/**
 * LocaleContext — contexto client-side de i18n para o YOUR GAZE SPA.
 *
 * Por que import estático (não getDictionary async)?
 * Todo o app é renderizado no client (Client Components).
 * Os JSONs são pequenos (~2 KB cada), então importar os 3 locales de uma vez
 * é a abordagem correta: zero latência, zero waterfall, 100% tipado.
 *
 * O getDictionary() em lib/i18n.ts é reservado para Server Components
 * e API Routes que serão adicionados futuramente.
 */

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Locale, Dictionary } from '@/lib/i18n'

// Imports estáticos — tree-shaken se o bundle suportar, mas em SPA é tudo usado
import ptDict from '@/dictionaries/pt.json'
import enDict from '@/dictionaries/en.json'
import esDict from '@/dictionaries/es.json'

const dicts: Record<Locale, Dictionary> = {
  pt: ptDict as Dictionary,
  en: enDict as Dictionary,
  es: esDict as Dictionary,
}

// ─── Contexto ─────────────────────────────────────────────────────────────────

type LocaleCtxType = {
  locale: Locale
  dict: Dictionary
  setLocale: (locale: Locale) => void
}

const LocaleCtx = createContext<LocaleCtxType | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function LocaleProvider({
  children,
  initial = 'en',
}: {
  children: ReactNode
  /** Locale inicial. Trocar para 'pt' quando o PT for o default de produção. */
  initial?: Locale
}) {
  const [locale, setLocale] = useState<Locale>(initial)

  return (
    <LocaleCtx.Provider value={{ locale, dict: dicts[locale], setLocale }}>
      {children}
    </LocaleCtx.Provider>
  )
}

// ─── Hooks públicos ───────────────────────────────────────────────────────────

/** Retorna o dicionário do locale ativo. */
export function useDict(): Dictionary {
  const ctx = useContext(LocaleCtx)
  if (!ctx) throw new Error('useDict must be used within <LocaleProvider>')
  return ctx.dict
}

/** Retorna o locale ativo e a função para trocá-lo. */
export function useLocale(): { locale: Locale; setLocale: (l: Locale) => void } {
  const ctx = useContext(LocaleCtx)
  if (!ctx) throw new Error('useLocale must be used within <LocaleProvider>')
  return { locale: ctx.locale, setLocale: ctx.setLocale }
}
