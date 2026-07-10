'use client'

import { useRef, useState } from 'react'
import {
  UploadCloud,
  ImageIcon,
  Video,
  Music,
  X,
  Lock,
  Globe,
  Crown,
  Gem,
  Star,
  CheckCircle2,
  FileVideo,
  FileImage,
  FileAudio,
  Loader2,
  Gift,
  DollarSign,
  BarChart2,
  Plus,
  Trash2,
  Clock,
  type LucideIcon,
} from 'lucide-react'
import { useDict } from '@/lib/locale-context'
import { cn } from '@/lib/utils'

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Visibilidade = 'publico' | 'exclusivo'
type Tier = 'Premium' | 'Premium Gold' | 'Premium Diamond'
type ModoPublicacao = 'padrao' | 'leilao_mimos' | 'enquete'
type Duracao = '24h' | '3d' | '7d'

type FilePreview = {
  name: string
  size: string
  tipo: 'foto' | 'video' | 'audio'
}

type RecenteItem = {
  name: string
  size: string
  tipo: string
  tier: string
  vis: 'publico' | 'exclusivo'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function detectTipo(file: File): FilePreview['tipo'] {
  if (file.type.startsWith('image/')) return 'foto'
  if (file.type.startsWith('video/')) return 'video'
  return 'audio'
}

const TIER_CONFIG: Record<Tier, { label: string; icon: LucideIcon; color: string; ring: string }> = {
  'Premium': {
    label: 'Premium',
    icon: Star,
    color: 'border-navy/40 text-navy',
    ring: 'ring-navy/30',
  },
  'Premium Gold': {
    label: 'Premium Gold',
    icon: Crown,
    color: 'border-gold text-gold',
    ring: 'ring-gold/40',
  },
  'Premium Diamond': {
    label: 'Premium Diamond',
    icon: Gem,
    color: 'border-[#c084fc] text-[#7c3aed]',
    ring: 'ring-[#c084fc]/40',
  },
}

// ─── Zona de Drag & Drop ──────────────────────────────────────────────────────
function DropZone({
  onFiles,
  hasFiles,
}: {
  onFiles: (files: File[]) => void
  hasFiles: boolean
}) {
  const t = useDict()
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handle = (files: FileList | null) => {
    if (!files) return
    onFiles(Array.from(files))
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
      onDragEnter={() => setDrag(true)}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files) }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed py-16 text-center transition-all duration-200',
        drag
          ? 'border-gold bg-gold/8 scale-[1.01]'
          : hasFiles
            ? 'border-green-400 bg-green-50/50'
            : 'border-navy/20 bg-background hover:border-gold/60 hover:bg-gold/5',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*"
        className="hidden"
        onChange={(e) => handle(e.target.files)}
      />

      {/* Ícone central animado */}
      <div
        className={cn(
          'flex size-20 items-center justify-center rounded-full transition-colors',
          drag ? 'bg-gold/20' : hasFiles ? 'bg-green-100' : 'bg-gold/10',
        )}
      >
        {hasFiles ? (
          <CheckCircle2 className="size-10 text-green-600" />
        ) : (
          <UploadCloud
            className={cn('size-10 transition-colors', drag ? 'text-gold' : 'text-gold/70')}
          />
        )}
      </div>

      <div>
        <p className="text-base font-semibold text-navy">
          {drag
            ? t.maker_studio.drop_active
            : hasFiles
              ? t.maker_studio.drop_ready
              : t.maker_studio.drop_idle}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.maker_studio.drop_ou}{' '}
          <span className="font-semibold text-gold underline underline-offset-2">
            {t.maker_studio.drop_clique}
          </span>
        </p>
      </div>

      {/* Tipos aceitos */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <ImageIcon className="size-4 text-navy/50" /> {t.maker_studio.drop_fotos}
        </span>
        <span className="flex items-center gap-1.5">
          <Video className="size-4 text-navy/50" /> {t.maker_studio.drop_videos}
        </span>
        <span className="flex items-center gap-1.5">
          <Music className="size-4 text-navy/50" /> {t.maker_studio.drop_audios}
        </span>
        <span className="text-navy/30">· até 2 GB</span>
      </div>
    </div>
  )
}

// ─── Preview dos arquivos selecionados ───────────────────────────────────────
function FileList({
  files,
  onRemove,
}: {
  files: FilePreview[]
  onRemove: (name: string) => void
}) {
  const t = useDict()
  if (files.length === 0) return null

  const TipoIcon = ({ tipo }: { tipo: FilePreview['tipo'] }) =>
    tipo === 'foto' ? (
      <FileImage className="size-5 text-gold" />
    ) : tipo === 'video' ? (
      <FileVideo className="size-5 text-navy" />
    ) : (
      <FileAudio className="size-5 text-muted-foreground" />
    )

  return (
    <div className="mt-4 rounded-xl border border-border bg-card p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {files.length === 1
          ? `1 ${t.maker_studio.arquivo_selecionado}`
          : `${files.length} ${t.maker_studio.arquivos_selecionados}`}
      </p>
      <ul className="flex flex-col divide-y divide-border">
        {files.map((f) => (
          <li key={f.name} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <TipoIcon tipo={f.tipo} />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-navy">{f.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{f.tipo} · {f.size}</p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(f.name)}
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Toggle Público / Exclusivo ───────────────────────────────────────────────
function VisibilidadeToggle({
  value,
  onChange,
}: {
  value: Visibilidade
  onChange: (v: Visibilidade) => void
}) {
  const t = useDict()
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {t.maker_studio.vis_label}
      </label>

      <div className="grid grid-cols-2 gap-3">
        {/* Público */}
        <button
          type="button"
          onClick={() => onChange('publico')}
          className={cn(
            'flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all',
            value === 'publico'
              ? 'border-navy bg-navy/5 shadow-sm'
              : 'border-border hover:border-navy/40',
          )}
        >
          <div className="flex items-center gap-2">
            <Globe
              className={cn('size-5', value === 'publico' ? 'text-navy' : 'text-muted-foreground')}
            />
            <span
              className={cn(
                'text-sm font-semibold',
                value === 'publico' ? 'text-navy' : 'text-muted-foreground',
              )}
            >
              {t.maker_studio.vis_publico}
            </span>
            {value === 'publico' && (
              <span className="ml-auto rounded-full bg-navy/10 px-2 py-0.5 text-[10px] font-bold text-navy">
                {t.maker_studio.vis_ativo}
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t.maker_studio.vis_pub_desc}
          </p>
        </button>

        {/* Exclusivo */}
        <button
          type="button"
          onClick={() => onChange('exclusivo')}
          className={cn(
            'flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all',
            value === 'exclusivo'
              ? 'border-gold bg-gold/8 shadow-sm'
              : 'border-border hover:border-gold/40',
          )}
        >
          <div className="flex items-center gap-2">
            <Lock
              className={cn('size-5', value === 'exclusivo' ? 'text-gold' : 'text-muted-foreground')}
            />
            <span
              className={cn(
                'text-sm font-semibold',
                value === 'exclusivo' ? 'text-gold' : 'text-muted-foreground',
              )}
            >
              {t.maker_studio.vis_exclusivo}
            </span>
            {value === 'exclusivo' && (
              <span className="ml-auto rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
                {t.maker_studio.vis_ativo}
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t.maker_studio.vis_exc_desc}
          </p>
        </button>
      </div>
    </div>
  )
}

// ─── Seletor de Tier ──────────────────────────────────────────────────────────
function TierSelector({
  value,
  onChange,
}: {
  value: Tier
  onChange: (t: Tier) => void
}) {
  const dict = useDict()
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {dict.maker_studio.tier_label}
      </label>
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(TIER_CONFIG) as Tier[]).map((tier) => {
          const { label, icon: Icon, color, ring } = TIER_CONFIG[tier]
          const active = value === tier
          return (
            <button
              key={tier}
              type="button"
              onClick={() => onChange(tier)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 px-2 text-center transition-all',
                active ? `${color} ring-2 ${ring} shadow-sm` : 'border-border text-muted-foreground hover:border-gold/40',
              )}
            >
              <Icon className={cn('size-5', active ? '' : 'opacity-40')} />
              <span className="text-[11px] font-semibold leading-tight">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Histórico de uploads recentes ───────────────────────────────────────────
const recentes: RecenteItem[] = [
  { name: 'ensaio-dourado.mp4', size: '1,2 GB', tipo: 'Vídeo', tier: 'Premium Diamond', vis: 'exclusivo' },
  { name: 'editorial-azul.jpg', size: '8 MB',   tipo: 'Foto',  tier: 'Premium Gold',    vis: 'exclusivo' },
  { name: 'bastidores.jpg',     size: '4 MB',   tipo: 'Foto',  tier: '—',               vis: 'publico'   },
  { name: 'podcast-ep03.mp3',   size: '64 MB',  tipo: 'Áudio', tier: 'Premium',         vis: 'exclusivo' },
]

function UploadsRecentes() {
  const t = useDict()
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-4 font-heading text-lg text-navy">{t.maker_studio.uploads_recentes}</h3>
      <ul className="flex flex-col divide-y divide-border">
        {recentes.map((f) => (
          <li key={f.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-lg',
                f.vis === 'exclusivo' ? 'bg-gold/10' : 'bg-secondary',
              )}
            >
              {f.vis === 'exclusivo' ? (
                <Lock className="size-4 text-gold" />
              ) : (
                <Globe className="size-4 text-navy/50" />
              )}
            </span>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-navy">{f.name}</p>
              <p className="text-xs text-muted-foreground">
                {f.tipo} · {f.size}
                {f.vis === 'exclusivo' && (
                  <> · <span className="text-gold">{f.tier}</span></>
                )}
              </p>
            </div>
            <span
              className={cn(
                'shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold',
                f.vis === 'exclusivo'
                  ? 'bg-gold/10 text-gold'
                  : 'bg-secondary text-navy/60',
              )}
            >
              {f.vis === 'exclusivo' ? t.maker_studio.badge_exclusivo : t.maker_studio.badge_degustacao}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Formulário de Postagem ───────────────────────────────────────────────────
function PostForm({
  files,
  onSubmit,
}: {
  files: FilePreview[]
  onSubmit: () => void
}) {
  const t = useDict()
  const [titulo, setTitulo] = useState('')
  const [legenda, setLegenda] = useState('')
  const [visibilidade, setVisibilidade] = useState<Visibilidade>('exclusivo')
  const [tier, setTier] = useState<Tier>('Premium Gold')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const fieldCls =
    'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold focus:ring-1 focus:ring-gold resize-none'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting || done) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1800))
    setSubmitting(false)
    setDone(true)
    onSubmit()
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-green-200 bg-green-50 py-12 text-center">
        <CheckCircle2 className="size-12 text-green-600" />
        <p className="font-heading text-xl text-navy">{t.maker_studio.post_sucesso}</p>
        <p className="text-sm text-muted-foreground">{t.maker_studio.post_sucesso_desc}</p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="rounded-xl border border-border px-5 py-2 text-sm font-medium text-navy hover:bg-secondary"
        >
          {t.maker_studio.post_outro}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6">
      <h3 className="font-heading text-lg text-navy">{t.maker_studio.post_section}</h3>

      {/* Título */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t.maker_studio.post_titulo_label}
        </label>
        <input
          required
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder={t.maker_studio.post_titulo_ph}
          className={fieldCls}
        />
      </div>

      {/* Legenda */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t.maker_studio.post_legenda_label}
        </label>
        <textarea
          value={legenda}
          onChange={(e) => setLegenda(e.target.value)}
          placeholder={t.maker_studio.post_legenda_ph}
          rows={3}
          className={fieldCls}
        />
      </div>

      {/* Toggle de visibilidade */}
      <VisibilidadeToggle value={visibilidade} onChange={setVisibilidade} />

      {/* Seletor de tier — só aparece para conteúdo exclusivo */}
      {visibilidade === 'exclusivo' && (
        <TierSelector value={tier} onChange={setTier} />
      )}

      {/* Resumo do post */}
      <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-xs text-muted-foreground">
        <span className="font-semibold text-navy">{t.maker_studio.post_resumo} </span>
        {files.length > 0 ? `${files.length} arquivo(s)` : t.maker_studio.post_sem_arquivos} ·{' '}
        {visibilidade === 'publico' ? (
          <span className="text-navy">{t.maker_studio.post_deg_publica}</span>
        ) : (
          <span className="text-gold">{t.maker_studio.vis_exclusivo} — {tier}</span>
        )}
      </div>

      {/* Botão de publicar */}
      <button
        type="submit"
        disabled={files.length === 0 || !titulo || submitting}
        className={cn(
          'rounded-xl py-3.5 text-sm font-bold tracking-wide transition-all',
          visibilidade === 'exclusivo'
            ? 'bg-gradient-to-r from-gold/90 to-gold text-navy shadow-md hover:opacity-90'
            : 'bg-navy text-primary-foreground hover:opacity-90',
          (files.length === 0 || !titulo || submitting) && 'cursor-not-allowed opacity-50',
        )}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            {t.maker_studio.post_publicando}
          </span>
        ) : visibilidade === 'exclusivo' ? (
          t.maker_studio.post_exc_btn
        ) : (
          t.maker_studio.post_pub_btn
        )}
      </button>
    </form>
  )
}

// ─── Seletor de Modo de Publicação ────────────────────────────────────────────
type ModoOption = {
  key: ModoPublicacao
  icon: LucideIcon
  labelKey: 'leilao_modo_padrao' | 'leilao_modo_mimo' | 'enquete_modo'
  activeColor: string
  activeBorder: string
  activeBg: string
}

const MODO_OPTIONS: ModoOption[] = [
  {
    key: 'padrao',
    icon: UploadCloud,
    labelKey: 'leilao_modo_padrao',
    activeColor: 'text-navy',
    activeBorder: 'border-navy',
    activeBg: 'bg-navy/5',
  },
  {
    key: 'leilao_mimos',
    icon: Gift,
    labelKey: 'leilao_modo_mimo',
    activeColor: 'text-gold',
    activeBorder: 'border-gold',
    activeBg: 'bg-gold/8',
  },
  {
    key: 'enquete',
    icon: BarChart2,
    labelKey: 'enquete_modo',
    activeColor: 'text-[#7c3aed]',
    activeBorder: 'border-[#c084fc]',
    activeBg: 'bg-[#c084fc]/8',
  },
]

function ModoSelector({
  modo,
  onChange,
}: {
  modo: ModoPublicacao
  onChange: (m: ModoPublicacao) => void
}) {
  const t = useDict()
  return (
    <div className="grid grid-cols-3 gap-2">
      {MODO_OPTIONS.map(({ key, icon: Icon, labelKey, activeColor, activeBorder, activeBg }) => {
        const active = modo === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border-2 px-2 py-3 text-center transition-all',
              active
                ? `${activeBorder} ${activeBg} shadow-sm`
                : 'border-border hover:border-border/80',
            )}
          >
            <Icon
              className={cn('size-5 shrink-0', active ? activeColor : 'text-muted-foreground/50')}
            />
            <p
              className={cn(
                'text-[11px] font-semibold leading-tight',
                active ? activeColor : 'text-muted-foreground',
              )}
            >
              {t.maker_studio[labelKey]}
            </p>
          </button>
        )
      })}
    </div>
  )
}

// ─── Barra de Progresso de Arrecadação (preview e feed) ──────────────────────
export function MimoProgressBar({
  alvo,
  arrecadado,
  compact = false,
}: {
  alvo: number
  arrecadado: number
  compact?: boolean
}) {
  const pct = Math.min((arrecadado / alvo) * 100, 100)
  const fmt = (v: number) =>
    v.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

  return (
    <div className={cn('flex flex-col gap-1.5', compact && 'gap-1')}>
      {/* Valores */}
      <div className="flex items-baseline justify-between">
        <span className={cn('font-bold text-gold', compact ? 'text-sm' : 'text-base')}>
          {fmt(arrecadado)}
        </span>
        <span className={cn('text-muted-foreground', compact ? 'text-[11px]' : 'text-xs')}>
          {fmt(alvo)}
        </span>
      </div>
      {/* Trilho */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold/80 to-gold transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Percentual */}
      <p className={cn('text-right text-muted-foreground', compact ? 'text-[10px]' : 'text-xs')}>
        {pct.toFixed(0)}%
      </p>
    </div>
  )
}

// ─── Formulário Leilão de Mimos ───────────────────────────────────────────────
function LeilaoMimosForm({
  files,
  onSubmit,
}: {
  files: FilePreview[]
  onSubmit: () => void
}) {
  const t = useDict()
  const [titulo, setTitulo] = useState('')
  const [legenda, setLegenda] = useState('')
  const [alvo, setAlvo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const fieldCls =
    'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold focus:ring-1 focus:ring-gold resize-none'

  const hasVideo = files.some((f) => f.tipo === 'video')
  const alvoNum = parseFloat(alvo) || 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting || done) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1800))
    setSubmitting(false)
    setDone(true)
    onSubmit()
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-gold/30 bg-gold/5 py-12 text-center">
        <Gift className="size-12 text-gold" />
        <p className="font-heading text-xl text-navy">{t.maker_studio.post_sucesso}</p>
        <p className="text-sm text-muted-foreground">{t.maker_studio.leilao_btn} lançado!</p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="rounded-xl border border-border px-5 py-2 text-sm font-medium text-navy hover:bg-secondary"
        >
          {t.maker_studio.post_outro}
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-2xl border border-gold/40 bg-card p-6 shadow-sm"
    >
      {/* Header do módulo */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-gold/15">
          <Gift className="size-5 text-gold" />
        </div>
        <div>
          <h3 className="font-heading text-lg text-navy">{t.maker_studio.leilao_modo_mimo}</h3>
          <p className="text-xs text-muted-foreground">{t.maker_studio.leilao_modo_mimo_desc}</p>
        </div>
      </div>

      {/* Aviso: apenas vídeos */}
      {!hasVideo && files.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
          <Video className="mt-0.5 size-3.5 shrink-0" />
          Selecione um arquivo de vídeo para lançar o Leilão de Mimos.
        </div>
      )}

      {/* Título */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t.maker_studio.post_titulo_label}
        </label>
        <input
          required
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder={t.maker_studio.post_titulo_ph}
          className={fieldCls}
        />
      </div>

      {/* Legenda */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t.maker_studio.post_legenda_label}
        </label>
        <textarea
          value={legenda}
          onChange={(e) => setLegenda(e.target.value)}
          placeholder={t.maker_studio.post_legenda_ph}
          rows={3}
          className={fieldCls}
        />
      </div>

      {/* Valor Alvo */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t.maker_studio.leilao_alvo_label}
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
          <input
            required
            type="number"
            min="10"
            step="10"
            value={alvo}
            onChange={(e) => setAlvo(e.target.value)}
            placeholder={t.maker_studio.leilao_alvo_ph}
            className={cn(fieldCls, 'pl-9')}
          />
        </div>
      </div>

      {/* Preview da barra de progresso */}
      {alvoNum > 0 && (
        <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t.maker_studio.leilao_preview}
          </p>
          <MimoProgressBar alvo={alvoNum} arrecadado={0} />
          <p className="mt-2 text-center text-[11px] italic text-muted-foreground">
            A barra começa em US$&nbsp;0 — avança conforme os fãs enviam mimos.
          </p>
        </div>
      )}

      {/* Botão de lançar */}
      <button
        type="submit"
        disabled={!hasVideo || !titulo || !alvo || submitting}
        className={cn(
          'rounded-xl py-3.5 text-sm font-bold tracking-wide transition-all',
          'bg-gradient-to-r from-gold/80 to-gold text-navy shadow-md hover:opacity-90',
          (!hasVideo || !titulo || !alvo || submitting) && 'cursor-not-allowed opacity-50',
        )}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Lançando…
          </span>
        ) : (
          t.maker_studio.leilao_btn
        )}
      </button>
    </form>
  )
}

// ─── Formulário de Enquete Rápida ─────────────────────────────────────────────
function EnqueteForm({ onSubmit }: { onSubmit: () => void }) {
  const t = useDict()
  const fieldCls =
    'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold focus:ring-1 focus:ring-gold'

  const [pergunta, setPergunta] = useState('')
  const [opcoes, setOpcoes] = useState<string[]>(['', ''])
  const [duracao, setDuracao] = useState<Duracao>('3d')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const addOpcao = () => {
    if (opcoes.length < 6) setOpcoes((prev) => [...prev, ''])
  }

  const removeOpcao = (idx: number) => {
    if (opcoes.length > 2) setOpcoes((prev) => prev.filter((_, i) => i !== idx))
  }

  const setOpcao = (idx: number, val: string) =>
    setOpcoes((prev) => prev.map((o, i) => (i === idx ? val : o)))

  const opcoesValidas = opcoes.every((o) => o.trim().length > 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting || done || !opcoesValidas) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1600))
    setSubmitting(false)
    setDone(true)
    onSubmit()
  }

  const duracaoOptions: { key: Duracao; label: string }[] = [
    { key: '24h', label: t.maker_studio.enquete_24h },
    { key: '3d',  label: t.maker_studio.enquete_3d  },
    { key: '7d',  label: t.maker_studio.enquete_7d  },
  ]

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#c084fc]/30 bg-[#c084fc]/5 py-12 text-center">
        <BarChart2 className="size-12 text-[#7c3aed]" />
        <p className="font-heading text-xl text-navy">{t.maker_studio.post_sucesso}</p>
        <p className="text-sm text-muted-foreground">Enquete publicada para seus fãs!</p>
        <button
          type="button"
          onClick={() => { setDone(false); setPergunta(''); setOpcoes(['', '']); setDuracao('3d') }}
          className="rounded-xl border border-border px-5 py-2 text-sm font-medium text-navy hover:bg-secondary"
        >
          {t.maker_studio.post_outro}
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 rounded-2xl border border-[#c084fc]/40 bg-card p-6 shadow-sm"
    >
      {/* Header do módulo */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-[#c084fc]/15">
          <BarChart2 className="size-5 text-[#7c3aed]" />
        </div>
        <div>
          <h3 className="font-heading text-lg text-navy">{t.maker_studio.enquete_modo}</h3>
          <p className="text-xs text-muted-foreground">
            Crie votações interativas diretamente no feed dos seus fãs.
          </p>
        </div>
      </div>

      {/* Pergunta */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t.maker_studio.enquete_pergunta_label}
        </label>
        <input
          required
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          placeholder={t.maker_studio.enquete_pergunta_ph}
          className={fieldCls}
          maxLength={120}
        />
        <p className="mt-1 text-right text-[10px] text-muted-foreground/60">
          {pergunta.length}/120
        </p>
      </div>

      {/* Opções de Voto */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t.maker_studio.enquete_opcoes_label}
        </label>
        <div className="flex flex-col gap-2">
          {opcoes.map((opcao, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#c084fc]/15 text-[10px] font-bold text-[#7c3aed]">
                {idx + 1}
              </span>
              <input
                required
                value={opcao}
                onChange={(e) => setOpcao(idx, e.target.value)}
                placeholder={`${t.maker_studio.enquete_opcao_ph}`}
                className={cn(fieldCls, 'flex-1')}
                maxLength={60}
              />
              {opcoes.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOpcao(idx)}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Botão adicionar opção */}
        {opcoes.length < 6 && (
          <button
            type="button"
            onClick={addOpcao}
            className="mt-3 flex items-center gap-1.5 rounded-lg border border-dashed border-[#c084fc]/50 px-4 py-2 text-sm font-medium text-[#7c3aed] transition-colors hover:border-[#c084fc] hover:bg-[#c084fc]/5"
          >
            <Plus className="size-4" />
            {t.maker_studio.enquete_adicionar}
          </button>
        )}
      </div>

      {/* Seletor de Duração */}
      <div>
        <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <Clock className="size-3.5" />
          {t.maker_studio.enquete_duracao}
        </label>
        <div className="flex gap-2">
          {duracaoOptions.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setDuracao(key)}
              className={cn(
                'flex-1 rounded-lg border-2 py-2.5 text-sm font-semibold transition-all',
                duracao === key
                  ? 'border-[#c084fc] bg-[#c084fc]/10 text-[#7c3aed]'
                  : 'border-border text-muted-foreground hover:border-[#c084fc]/40',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Resumo */}
      <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-xs text-muted-foreground">
        <span className="font-semibold text-navy">Resumo: </span>
        {opcoes.filter((o) => o.trim()).length} opções ·{' '}
        {duracaoOptions.find((d) => d.key === duracao)?.label}
        {!opcoesValidas && (
          <span className="ml-2 text-amber-600">Preencha todas as opções.</span>
        )}
      </div>

      {/* Botão de publicar */}
      <button
        type="submit"
        disabled={!pergunta || !opcoesValidas || submitting}
        className={cn(
          'rounded-xl py-3.5 text-sm font-bold tracking-wide transition-all',
          'bg-gradient-to-r from-[#c084fc]/80 to-[#7c3aed] text-white shadow-md hover:opacity-90',
          (!pergunta || !opcoesValidas || submitting) && 'cursor-not-allowed opacity-50',
        )}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Publicando enquete…
          </span>
        ) : (
          t.maker_studio.enquete_btn
        )}
      </button>
    </form>
  )
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export function UploadScreen() {
  const t = useDict()
  const [files, setFiles] = useState<FilePreview[]>([])
  const [modo, setModo] = useState<ModoPublicacao>('padrao')

  const addFiles = (incoming: File[]) => {
    const previews: FilePreview[] = incoming.map((f) => ({
      name: f.name,
      size: formatBytes(f.size),
      tipo: detectTipo(f),
    }))
    setFiles((prev) => {
      const names = new Set(prev.map((p) => p.name))
      return [...prev, ...previews.filter((p) => !names.has(p.name))]
    })
  }

  const removeFile = (name: string) =>
    setFiles((prev) => prev.filter((f) => f.name !== name))

  const reset = () => setFiles([])

  return (
    <div className="px-6 py-8">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-gold">
          {t.maker_studio.upload_badge}
        </p>
        <h2 className="font-heading text-3xl text-navy">{t.maker_studio.upload_title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.maker_studio.upload_subtitle}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Coluna esquerda: Drop + Modo + Form */}
        <div className="flex flex-col gap-4">
          {/* Enquete não usa upload de arquivo */}
          {modo !== 'enquete' && (
            <>
              <DropZone onFiles={addFiles} hasFiles={files.length > 0} />
              <FileList files={files} onRemove={removeFile} />
            </>
          )}

          {/* Seletor de modo de publicação */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Modo de Publicação
            </p>
            <ModoSelector modo={modo} onChange={(m) => { setModo(m); reset() }} />
          </div>

          {/* Formulário adaptado ao modo */}
          {modo === 'padrao' ? (
            <PostForm files={files} onSubmit={reset} />
          ) : modo === 'leilao_mimos' ? (
            <LeilaoMimosForm files={files} onSubmit={reset} />
          ) : (
            <EnqueteForm onSubmit={reset} />
          )}
        </div>

        {/* Coluna direita: Histórico */}
        <div className="lg:sticky lg:top-[69px] lg:self-start">
          <UploadsRecentes />
        </div>
      </div>
    </div>
  )
}
