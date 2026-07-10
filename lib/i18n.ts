/**
 * i18n foundation — YOUR GAZE
 *
 * Locales suportados: pt (padrão), en, es.
 * Usage (Server Component / Route Handler):
 *   const t = await getDictionary('pt')
 *   t.auth.login  // → "Entrar"
 *
 * Usage (Client Component):
 *   // Passe o dicionário como prop vindo de um Server Component pai,
 *   // ou use o hook useDictionary() definido abaixo.
 */

// ─── Locales ──────────────────────────────────────────────────────────────────

export const locales = ['pt', 'en', 'es'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'pt'

// ─── Tipo do dicionário (derivado do JSON de referência) ──────────────────────

import type ptRaw from '@/dictionaries/pt.json'
export type Dictionary = typeof ptRaw

// ─── getDictionary (uso em Server Components e API routes) ───────────────────

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  pt: () => import('@/dictionaries/pt.json').then((m) => m.default as Dictionary),
  en: () => import('@/dictionaries/en.json').then((m) => m.default as Dictionary),
  es: () => import('@/dictionaries/es.json').then((m) => m.default as Dictionary),
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]()
}

// ─── isValidLocale (helper de validação) ─────────────────────────────────────

export function isValidLocale(value: unknown): value is Locale {
  return locales.includes(value as Locale)
}

// ─── detectLocale (detecção a partir do Accept-Language header) ───────────────
// Útil no middleware.ts quando ativarmos o roteamento por locale.

export function detectLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale
  const preferred = acceptLanguage
    .split(',')
    .map((s) => s.split(';')[0].trim().slice(0, 2).toLowerCase())
    .find((lang) => isValidLocale(lang))
  return (preferred as Locale | undefined) ?? defaultLocale
}
