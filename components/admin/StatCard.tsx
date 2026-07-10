import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type StatCardTrend = {
  /** Valor percentual (ex: 12.4). Positivo = alta, negativo = queda. */
  pct: number
  label?: string
}

export interface StatCardProps {
  /** Ícone Lucide ou outro ReactNode exibido no canto superior esquerdo */
  icon: ReactNode
  /** Rótulo principal do indicador */
  label: string
  /** Valor formatado (ex: "USD $48.320,00" ou "127") */
  value: string
  /** Tendência opcional exibida como badge colorida abaixo do valor */
  trend?: StatCardTrend
  /** Nota de rodapé descritiva (ex: "vs. mês anterior") */
  footnote?: string
  /** Destaque visual — borda dourada + fundo levemente iluminado */
  featured?: boolean
  className?: string
}

/**
 * StatCard — Card reutilizável de KPI para o Master Dashboard Admin.
 *
 * Design System: Dark Navy (#0F172A) com acentos Gold.
 * Uso:
 * ```tsx
 * <StatCard
 *   icon={<DollarSign className="size-5 text-amber-400" />}
 *   label="Receita Global"
 *   value="USD $48.320,00"
 *   trend={{ pct: 14.2, label: 'este mês' }}
 *   featured
 * />
 * ```
 */
export function StatCard({
  icon,
  label,
  value,
  trend,
  footnote,
  featured = false,
  className,
}: StatCardProps) {
  const isPositive = trend && trend.pct >= 0

  return (
    <div
      className={cn(
        'relative flex flex-col gap-3 rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md',
        featured
          ? 'border-amber-500/40 bg-gradient-to-br from-slate-900 to-slate-950 shadow-amber-900/20'
          : 'border-slate-800 bg-slate-900',
        className,
      )}
    >
      {/* Faixa dourada lateral nos cards em destaque */}
      {featured && (
        <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-400" />
      )}

      {/* Cabeçalho: ícone + rótulo */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700">
          {icon}
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>

      {/* Valor principal */}
      <p className={cn(
        'font-extrabold leading-none tracking-tight',
        value.length > 12 ? 'text-2xl' : 'text-3xl',
        featured ? 'text-amber-400' : 'text-white',
      )}>
        {value}
      </p>

      {/* Trend badge */}
      {trend && (
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold',
              isPositive
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/15 text-red-400 border border-red-500/20',
            )}
          >
            {isPositive ? '↑' : '↓'} {Math.abs(trend.pct).toFixed(1)}%
          </span>
          {trend.label && (
            <span className="text-[11px] text-slate-500">{trend.label}</span>
          )}
        </div>
      )}

      {/* Rodapé */}
      {footnote && (
        <p className="text-[11px] text-slate-500 border-t border-slate-800 pt-2 mt-auto">
          {footnote}
        </p>
      )}
    </div>
  )
}
