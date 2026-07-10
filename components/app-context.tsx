'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const STORAGE_KEY = 'yourgaze:state'

// ─── Constantes de segurança admin ───────────────────────────────────────────
// Defina NEXT_PUBLIC_ADMIN_EMAIL e NEXT_PUBLIC_ADMIN_TOKEN no .env.local.
// Se NEXT_PUBLIC_ADMIN_EMAIL não estiver definido, o painel admin fica
// completamente inacessível — nenhum token o desbloqueará.
const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? '').toLowerCase().trim()
const ADMIN_TOKEN = (process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? 'YOURGAZE-MASTER').trim()

type Persisted = {
  screen: Screen
  accountType: AccountType | null
  /** Substitui isFiel: boolean. Contém maker IDs assinados + '*' para acesso global. */
  subscribedMakerIds: string[]
  // isAdmin NÃO é persistido — deve ser revalidado a cada sessão com email + token.
  page: PageKey
}

/**
 * Carrega o estado priorizando o parâmetro de URL (?step=...) e, em seguida,
 * o localStorage. Apenas screens não-transientes ('app') são restauradas do
 * localStorage — login e onboarding nunca são persistidas para evitar que o
 * site pule etapas automaticamente ao recarregar.
 */
function loadPersisted(): Persisted | null {
  if (typeof window === 'undefined') return null

  // 1) Parâmetro de URL tem prioridade (deep-link para onboarding).
  try {
    const step = new URLSearchParams(window.location.search).get('step')
    if (step === 'onboarding-espectador') {
      return { screen: 'onboarding', accountType: 'espectador', subscribedMakerIds: [], page: 'feed' }
    }
    if (step === 'onboarding-maker') {
      return { screen: 'onboarding', accountType: 'maker', subscribedMakerIds: [], page: 'metricas' }
    }
  } catch {
    // ignore
  }

  // 2) Somente restaura o estado 'app' do localStorage; login/onboarding/landing
  //    são transientes e nunca devem ser restaurados após um reload.
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Persisted & { isFiel?: boolean; isAdmin?: boolean }
    if (parsed.screen !== 'app') return null
    // Migração de formato antigo (isFiel: boolean) → subscribedMakerIds: string[]
    const subscribedMakerIds =
      parsed.subscribedMakerIds ?? (parsed.isFiel ? ['*'] : [])
    // isAdmin nunca é restaurado do localStorage — ejetado intencionalmente.
    const { isAdmin: _dropped, ...rest } = { ...parsed, subscribedMakerIds }
    void _dropped
    return rest
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
export type Screen = 'landing' | 'login' | 'onboarding' | 'app'

export type PageKey =
  | 'inicio'
  | 'feed'
  | 'degustacao'
  | 'chat'
  | 'assinaturas'
  | 'cursos'
  | 'transmissao'
  | 'upload'
  | 'precificacao'
  | 'metricas'
  | 'dashboard'
  | 'payout'
  | 'lives'
  | 'indicacoes'
  | 'produtos'
  | 'perfil'
  | 'config'
  | 'suporte'
  | 'admin'

type AppState = {
  screen: Screen
  accountType: AccountType | null
  /** Derivado: true se houver ao menos um makerId (ou '*') na lista. */
  isFiel: boolean
  /** Array granular de maker IDs assinados. '*' = acesso global (checkout sem maker específico). */
  subscribedMakerIds: string[]
  isAdmin: boolean
  /**
   * true quando o e-mail do usuário logado corresponde a NEXT_PUBLIC_ADMIN_EMAIL.
   * Necessário mas não suficiente: o admin ainda deve apresentar o token master.
   */
  isAdminEligible: boolean
  page: PageKey
  user: User | null
  /** Retorna true se o usuário assinou aquele maker específico ou tem acesso global ('*'). */
  isSubscribedTo: (makerId: string) => boolean
  /** Assina um maker específico (adiciona ao array se não existir). */
  subscribeTo: (makerId: string) => void
  goToLanding: () => void
  startLogin: () => void
  startOnboarding: (type: AccountType) => void
  completeOnboarding: () => void
  completeLogin: (role: AccountType | null) => void
  /** Mantido para compatibilidade com checkout-modal: assina com marcador global '*'. */
  becomeFiel: () => void
  /**
   * Valida o token master E o e-mail admin antes de conceder acesso.
   * Retorna true em caso de sucesso, false em caso de falha.
   * Logs de segurança escritos via console.warn para auditoria.
   */
  enterAdmin: (token: string) => boolean
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
  /**
   * Demo: pré-assinada a Valentina ('m1') para testar o desbloqueio parcial.
   * Em produção, este array será carregado do Supabase após o login.
   */
  const [subscribedMakerIds, setSubscribedMakerIds] = useState<string[]>(['m1'])
  const [isAdmin, setIsAdmin] = useState(false)
  const [page, setPage] = useState<PageKey>('feed')
  const [hydrated, setHydrated] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // isFiel é derivado — true se houver ao menos um ID assinado (incluindo '*')
  const isFiel = subscribedMakerIds.length > 0

  // isAdminEligible é derivado do e-mail logado vs. NEXT_PUBLIC_ADMIN_EMAIL.
  // Necessário, mas não suficiente: o usuário ainda deve apresentar o token master.
  const isAdminEligible = Boolean(
    ADMIN_EMAIL && user?.email?.toLowerCase().trim() === ADMIN_EMAIL,
  )

  // Restaura a navegação salva (URL + localStorage) após montar no cliente
  // e conecta ao listener de sessão do Supabase Auth.
  useEffect(() => {
    const saved = loadPersisted()
    if (saved) {
      setScreen(saved.screen)
      setAccountType(saved.accountType)
      setSubscribedMakerIds(saved.subscribedMakerIds)
      // isAdmin NÃO é restaurado do localStorage — sempre começa como false.
      setPage(saved.page)
    }
    setHydrated(true)

    // Verifica sessão ativa no Supabase apenas para popular `user`.
    // NÃO avançamos para 'app' automaticamente: o usuário deve passar pelo
    // fluxo de login explicitamente. Isso evita que tokens residuais do
    // Supabase (sb-xxx-auth-token) pulem as telas de autenticação.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Escuta mudanças de sessão em tempo real (login, logout, refresh de token).
    // Apenas sincroniza o objeto `user`; a navegação de tela é controlada
    // exclusivamente pelas ações explícitas (completeLogin, completeOnboarding).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Persiste apenas o estado 'app' no localStorage.
  // Screens transientes (landing, login, onboarding) limpam a entrada para
  // que um reload sempre retorne à landing — jamais pula etapas.
  useEffect(() => {
    if (!hydrated) return
    try {
      if (screen === 'app') {
        // isAdmin excluído intencionalmente — não persiste entre sessões.
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ screen, accountType, subscribedMakerIds, page }),
        )
      } else {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // ignore
    }
    syncUrl(screen, accountType)
  }, [hydrated, screen, accountType, subscribedMakerIds, isAdmin, page])

  const goToLanding = () => setScreen('landing')
  const startLogin = () => setScreen('login')

  const startOnboarding = (type: AccountType) => {
    setAccountType(type)
    setScreen('onboarding')
  }

  const completeOnboarding = () => {
    setScreen('app')
    setPage(accountType === 'maker' ? 'metricas' : 'feed')
  }

  // Chamado após login bem-sucedido com o role vindo do perfil do Supabase.
  const completeLogin = (role: AccountType | null) => {
    setAccountType(role)
    setScreen('app')
    setPage(role === 'maker' ? 'metricas' : 'feed')
  }

  /** Checa se o usuário assinou um maker específico ou tem acesso global ('*'). */
  const isSubscribedTo = (makerId: string) =>
    subscribedMakerIds.includes(makerId) || subscribedMakerIds.includes('*')

  /** Adiciona um maker ao array (idempotente). */
  const subscribeTo = (makerId: string) =>
    setSubscribedMakerIds((prev) => (prev.includes(makerId) ? prev : [...prev, makerId]))

  /** Compatibilidade com checkout-modal: assina com marcador global '*'. */
  const becomeFiel = () => subscribeTo('*')
  const enterAdmin = (token: string): boolean => {
    if (!isAdminEligible) {
      console.warn('[AdminGuard] Acesso negado — e-mail não autorizado:', user?.email ?? 'não logado')
      return false
    }
    if (token.trim() !== ADMIN_TOKEN) {
      console.warn('[AdminGuard] Acesso negado — token inválido.')
      return false
    }
    setIsAdmin(true)
    setPage('admin')
    return true
  }

  const exitAdmin = () => {
    setIsAdmin(false)
    setPage('config')
  }
  const navigate = (p: PageKey) => setPage(p)

  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // ignore — mesmo com falha, limpamos o estado local
    }
    // localStorage.clear() garante que os tokens do Supabase (sb-xxx-auth-token)
    // também sejam removidos, impedindo que a sessão seja restaurada no próximo
    // carregamento sem que o usuário passe pelo login explicitamente.
    try {
      window.localStorage.clear()
    } catch {
      // ignore
    }
    setScreen('landing')
    setAccountType(null)
    setSubscribedMakerIds([])
    setIsAdmin(false)
    setPage('feed')
    setUser(null)
  }

  return (
    <AppContext.Provider
      value={{
        screen,
        accountType,
        isFiel,
        subscribedMakerIds,
        isAdmin,
        isAdminEligible,
        page,
        user,
        isSubscribedTo,
        subscribeTo,
        goToLanding,
        startLogin,
        startOnboarding,
        completeOnboarding,
        completeLogin,
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
