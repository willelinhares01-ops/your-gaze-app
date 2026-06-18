'use client'

import {
  Home,
  Sparkles,
  MessageCircle,
  Crown,
  Radio,
  LayoutDashboard,
  UploadCloud,
  DollarSign,
  Trophy,
  Link2,
  ShoppingBag,
  Settings,
  LifeBuoy,
  Globe,
  ChevronDown,
  LogOut,
} from 'lucide-react'
import { FullLogo } from '@/components/brand/full-logo'
import { useApp, type PageKey } from '@/components/app-context'
import { cn } from '@/lib/utils'

type Item = { key: PageKey; label: string; icon: typeof Home }

const ESPECTADOR_NAV: Item[] = [
  { key: 'feed', label: 'Feed', icon: Home },
  { key: 'degustacao', label: 'Degustação', icon: Sparkles },
  { key: 'chat', label: 'Chat', icon: MessageCircle },
  { key: 'assinaturas', label: 'Assinaturas', icon: Crown },
  { key: 'transmissao', label: 'Transmissão', icon: Radio },
]

const MAKER_NAV: Item[] = [
  { key: 'metricas', label: 'Métricas de Vendas', icon: LayoutDashboard },
  { key: 'feed', label: 'Feed & Histórico', icon: Home },
  { key: 'chat', label: 'Chat', icon: MessageCircle },
  { key: 'upload', label: 'Gerenciador de Upload', icon: UploadCloud },
  { key: 'precificacao', label: 'Precificação', icon: DollarSign },
  { key: 'lives', label: 'Transmissões', icon: Trophy },
  { key: 'indicacoes', label: 'Indicações (MGM)', icon: Link2 },
  { key: 'produtos', label: 'Lista de Produtos', icon: ShoppingBag },
]

const COMMON_NAV: Item[] = [
  { key: 'config', label: 'Configurações', icon: Settings },
  { key: 'suporte', label: 'Suporte', icon: LifeBuoy },
]

export function Sidebar() {
  const { accountType, page, navigate, isFiel, logout } = useApp()
  const nav = accountType === 'maker' ? MAKER_NAV : ESPECTADOR_NAV

  return (
    <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col overflow-y-auto border-r border-border bg-sidebar px-6 py-8">
      <div className="flex flex-col items-center gap-3 px-2 text-center">
        <FullLogo width={208} />
        <p className="font-heading text-sm italic leading-relaxed text-muted-foreground text-balance">
          Veja e seja o que os outros não conseguem.
        </p>
        <span className="mt-1 rounded-full bg-navy px-3 py-1 text-xs font-medium text-gold">
          {accountType === 'maker' ? 'Maker' : isFiel ? 'Fiel Espectador' : 'Espectador'}
        </span>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1.5">
        {[...nav, ...COMMON_NAV].map(({ key, label, icon: Icon }) => {
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
                className={cn('size-5 shrink-0', active ? 'text-gold' : 'text-navy/50 group-hover:text-gold')}
                strokeWidth={1.75}
              />
              <span className="tracking-wide">{label}</span>
            </button>
          )
        })}
      </nav>

      <button
        type="button"
        onClick={logout}
        className="mb-3 flex items-center gap-4 rounded-xl px-4 py-3 text-left text-[15px] text-navy/70 transition-colors hover:bg-secondary hover:text-navy"
      >
        <LogOut className="size-5 text-navy/50" strokeWidth={1.75} />
        <span className="tracking-wide">Sair</span>
      </button>

      <button
        type="button"
        className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm text-navy transition-colors hover:bg-secondary"
      >
        <span className="flex items-center gap-3">
          <Globe className="size-5 text-gold" strokeWidth={1.75} />
          <span className="font-medium">yourgaze.br · PT</span>
        </span>
        <ChevronDown className="size-4 text-navy/50" />
      </button>
    </aside>
  )
}
