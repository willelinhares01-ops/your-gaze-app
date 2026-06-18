'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

const STORAGE_KEY = 'yourgaze:state'

type Persisted = {
  screen: Screen
  accountType: AccountType | null
  isFiel: boolean
  isAdmin: boolean
  page: PageKey
}

/**
 * Carrega o estado priorizando o parâmetro de URL (?step=...) e, em seguida,
 * o localStorage. Assim a navegação sobrevive a Fast Refresh, reloads e
 * compartilhamento de link.
 */
function loadPersisted(): Persisted | null {
  if (typeof window === 'undefined') return null

  // 1) Parâmetro de URL tem prioridade (deep-link).
  try {
    const step = new URLSearchParams(window.location.search).get('step')
    if (step === 'onboarding-espectador') {
      return { screen: 'onboarding', accountType: 'espectador', isFiel: false, isAdmin: false, page: 'feed' }
    }
    if (step === 'onboarding-maker') {
      return { screen: 'onboarding', accountType: 'maker', isFiel: false, isAdmin: false, page: 'metricas' }
    }
  } catch {
    // ignore
  }

  // 2) Estado salvo no localStorage.
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Persisted) : null
  } catch {
    return null
  }
}

/** Sincroniza o parâmetro ?step= da URL com a tela atual, sem recarregar. */
function syncUrl(screen: Screen, accountType: AccountType | null) {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (screen === 'onboarding' && accountType) {
    url.searchParams.set('step', `onboarding-${accountType}`)
  } else {
    url.searchParams.delete('step')
  }
  window.history.replaceState(null, '', url.toString())
}

export type AccountType = 'espectador' | 'maker'
export type Screen = 'landing' | 'onboarding' | 'app'

export type PageKey =
  | 'inicio'
  | 'feed'
  | 'degustacao'
  | 'chat'
  | 'assinaturas'
  | 'transmissao'
  | 'upload'
  | 'precificacao'
  | 'metricas'
  | 'lives'
  | 'indicacoes'
  | 'produtos'
  | 'config'
  | 'suporte'
  | 'admin'

type AppState = {
  screen: Screen
  accountType: AccountType | null
  isFiel: boolean
  isAdmin: boolean
  page: PageKey
  startOnboarding: (type: AccountType) => void
  completeOnboarding: () => void
  becomeFiel: () => void
  enterAdmin: () => void
  exitAdmin: () => void
  navigate: (page: PageKey) => void
  logout: () => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  // Inicia com o padrão (igual no servidor e no cliente) para evitar
  // hydration mismatch; o estado salvo é restaurado logo após a montagem.
  const [screen, setScreen] = useState<Screen>('landing')
  const [accountType, setAccountType] = useState<AccountType | null>(null)
  const [isFiel, setIsFiel] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [page, setPage] = useState<PageKey>('feed')
  const [hydrated, setHydrated] = useState(false)

  // Restaura a navegação salva (URL + localStorage) após montar no cliente.
  useEffect(() => {
    const saved = loadPersisted()
    if (saved) {
      setScreen(saved.screen)
      setAccountType(saved.accountType)
      setIsFiel(saved.isFiel)
      setIsAdmin(saved.isAdmin)
      setPage(saved.page)
    }
    setHydrated(true)
  }, [])

  // Mantém a navegação após recargas/HMR no preview (localStorage + URL).
  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ screen, accountType, isFiel, isAdmin, page }),
      )
    } catch {
      // ignore
    }
    syncUrl(screen, accountType)
  }, [hydrated, screen, accountType, isFiel, isAdmin, page])

  const startOnboarding = (type: AccountType) => {
    setAccountType(type)
    setScreen('onboarding')
  }

  const completeOnboarding = () => {
    setScreen('app')
    setPage(accountType === 'maker' ? 'metricas' : 'feed')
  }

  const becomeFiel = () => setIsFiel(true)
  const enterAdmin = () => {
    setIsAdmin(true)
    setPage('admin')
  }
  const exitAdmin = () => {
    setIsAdmin(false)
    setPage('config')
  }
  const navigate = (p: PageKey) => setPage(p)
  const logout = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    setScreen('landing')
    setAccountType(null)
    setIsFiel(false)
    setIsAdmin(false)
    setPage('feed')
  }

  return (
    <AppContext.Provider
      value={{
        screen,
        accountType,
        isFiel,
        isAdmin,
        page,
        startOnboarding,
        completeOnboarding,
        becomeFiel,
        enterAdmin,
        exitAdmin,
        navigate,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider')
  return ctx
}
