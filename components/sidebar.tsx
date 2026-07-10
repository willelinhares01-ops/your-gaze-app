'use client'

import {
  Home,
  Sparkles,
  MessageCircle,
  Crown,
  Radio,
  BookOpen,
  LayoutDashboard,
  BarChart3,
  UploadCloud,
  DollarSign,
  Landmark,
  Trophy,
  Link2,
  ShoppingBag,
  UserCircle2,
  Settings,
  LifeBuoy,
  Globe,
  ChevronDown,
  LogOut,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { FullLogo } from '@/components/brand/full-logo'
import { useApp, type PageKey } from '@/components/app-context'
import { useDict, useLocale } from '@/lib/locale-context'
import { cn } from '@/lib/utils'

// ─── Estrutura de navegação (sem labels — resolvidos via dicionário) ──────────

type NavItem = { key: PageKey; icon: LucideIcon }

const ESPECTADOR_NAV: NavItem[] = [
  { key: 'feed',        icon: Home },
  { key: 'degustacao',  icon: Sparkles },
  { key: 'chat',        icon: MessageCircle },
  { key: 'assinaturas', icon: Crown },
  { key: 'cursos',      icon: BookOpen },
  { key: 'transmissao', icon: Radio },
]

const MAKER_NAV: NavItem[] = [
  { key: 'metricas',    icon: LayoutDashboard },
  { key: 'dashboard',   icon: BarChart3 },
  { key: 'payout',      icon: Landmark },
  { key: 'feed',        icon: Home },
  { key: 'chat',        icon: MessageCircle },
  { key: 'upload',      icon: UploadCloud },
  { key: 'precificacao',icon: DollarSign },
  { key: 'lives',       icon: Trophy },
  { key: 'indicacoes',  icon: Link2 },
  { key: 'produtos',    icon: ShoppingBag },
  { key: 'perfil',      icon: UserCircle2 },
]

const COMMON_NAV: NavItem[] = [
  { key: 'config',  icon: Settings },
  { key: 'suporte', icon: LifeBuoy },
]

// ─── Componente ───────────────────────────────────────────────────────────────

export function Sidebar() {
  const { accountType, page, navigate, isFiel, logout, isAdmin, isAdminEligible } = useApp()
  const t = useDict()
  const { locale } = useLocale()

  const isMaker = accountType === 'maker'
  const nav = isMaker ? MAKER_NAV : ESPECTADOR_NAV

  // Mapa PageKey → label localizado.
  // Espectador e Maker partilham algumas chaves (feed, chat) com labels diferentes.
  const navLabel: Partial<Record<PageKey, string>> = isMaker
    ? {
        metricas:     t.sidebar.metricas,
        dashboard:    t.sidebar.dashboard,
        payout:       t.sidebar.payout,
        feed:         t.sidebar.feed_historico,
        chat:         t.sidebar.chat,
        upload:       t.sidebar.upload,
        precificacao: t.sidebar.precificacao,
        lives:        t.sidebar.lives,
        indicacoes:   t.sidebar.indicacoes,
        produtos:     t.sidebar.produtos,
        perfil:       t.sidebar.perfil,
        config:       t.sidebar.config,
        suporte:      t.sidebar.suporte,
      }
    : {
        feed:         t.sidebar.feed,
        degustacao:   t.sidebar.degustacao,
        chat:         t.sidebar.chat,
        assinaturas:  t.sidebar.assinaturas,
        cursos:       t.sidebar.cursos,
        transmissao:  t.sidebar.transmissao,
        config:       t.sidebar.config,
        suporte:      t.sidebar.suporte,
      }

  const getLabel = (key: PageKey) => navLabel[key] ?? key

  // Badge do perfil
  const badge = isMaker
    ? t.sidebar.badge_maker
    : isFiel
      ? t.sidebar.badge_fiel
      : t.sidebar.badge_viewer

  return (
    <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col overflow-y-auto border-r border-border bg-sidebar px-6 py-8">
      {/* Logo + slogan + badge */}
      <div className="flex flex-col items-center gap-3 px-2 text-center">
        <FullLogo width={208} />
        <p className="font-heading text-sm italic leading-relaxed text-muted-foreground text-balance">
          {t.landing.slogan}
        </p>
        <span className="mt-1 rounded-full bg-navy px-3 py-1 text-xs font-medium text-gold">
          {badge}
        </span>
      </div>

      {/* Itens de navegação */}
      <nav className="mt-8 flex flex-1 flex-col gap-1.5">
        {[...nav, ...COMMON_NAV].map(({ key, icon: Icon }) => {
          const active = page === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => navigate(key)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group flex items-center gap-4 rounded-xl px-4 py-3 text-left text-[15px] transition-colors',
                active
                  ? 'bg-sidebar-accent font-semibold text-navy'
                  : 'text-navy/70 hover:bg-secondary hover:text-navy',
              )}
            >
              <Icon
                className={cn(
                  'size-5 shrink-0',
                  active ? 'text-gold' : 'text-navy/50 group-hover:text-gold',
                )}
                strokeWidth={1.75}
              />
              <span className="tracking-wide">{getLabel(key)}</span>
            </button>
          )
        })}
      </nav>

      {/* Backoffice — visível somente quando já autenticado como admin */}
      {isAdmin && isAdminEligible && (
        <button
          type="button"
          onClick={() => navigate('admin')}
          aria-current={page === 'admin' ? 'page' : undefined}
          className={cn(
            'group mb-1 flex items-center gap-4 rounded-xl border px-4 py-3 text-left text-[15px] transition-colors',
            page === 'admin'
              ? 'border-gold/60 bg-gold/10 font-semibold text-navy'
              : 'border-gold/20 bg-gold/5 text-navy/70 hover:border-gold/50 hover:bg-gold/10 hover:text-navy',
          )}
        >
          <ShieldCheck
            className={cn('size-5 shrink-0', page === 'admin' ? 'text-gold' : 'text-gold/60 group-hover:text-gold')}
            strokeWidth={1.75}
          />
          <span className="tracking-wide">God Mode</span>
        </button>
      )}

      {/* Botão de sair */}
      <button
        type="button"
        onClick={logout}
        className="mb-3 flex items-center gap-4 rounded-xl px-4 py-3 text-left text-[15px] text-navy/70 transition-colors hover:bg-secondary hover:text-navy"
      >
        <LogOut className="size-5 text-navy/50" strokeWidth={1.75} />
        <span className="tracking-wide">{t.sidebar.sair}</span>
      </button>

      {/* Seletor de locale (visual — lógica de troca virá no próximo sprint) */}
      <button
        type="button"
        className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm text-navy transition-colors hover:bg-secondary"
        aria-label={`Current locale: ${locale.toUpperCase()}`}
      >
        <span className="flex items-center gap-3">
          <Globe className="size-5 text-gold" strokeWidth={1.75} />
          <span className="font-medium">{t.sidebar.locale_label}</span>
        </span>
        <ChevronDown className="size-4 text-navy/50" />
      </button>
    </aside>
  )
}
