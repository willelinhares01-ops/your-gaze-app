'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import {
  Send,
  Ban,
  ShieldX,
  Radio,
  X,
  Paperclip,
  DollarSign,
  Users,
  CheckCircle2,
  Loader2,
  Lock,
  Unlock,
  Play,
  ImageIcon,
} from 'lucide-react'
import { chatThreads, sampleMessages, type ChatMessage } from '@/lib/data'
import { useApp } from '@/components/app-context'
import { useDict } from '@/lib/locale-context'
import { cn } from '@/lib/utils'

// ─── Tipos ────────────────────────────────────────────────────────────────────
type Audiencia = 'todos' | 'assinantes' | 'gold'
type ChatTab   = 'all' | 'unlocked' | 'purchased'

// ─── Card de PPV (Pay-Per-View) ───────────────────────────────────────────────
function PPVMessageCard({ message }: { message: ChatMessage }) {
  const t = useDict()
  const [isUnlocked, setIsUnlocked] = useState(message.media?.unlocked || false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Guard — componente só é montado quando `media` está presente
  const media = message.media
  if (!media) return null

  const isVideo = media.type === 'video'

  const handleUnlock = () => {
    if (isProcessing || isUnlocked) return
    setIsProcessing(true)
    // Simula aprovação do Stripe (1 s de feedback UX)
    setTimeout(() => {
      // 1. Atualiza UI: remove o desfoque imediatamente
      setIsUnlocked(true)
      setIsProcessing(false)
      // 2. Propaga para a sessão em memória (fonte de verdade local)
      if (message.media) message.media.unlocked = true
    }, 1_000)
  }

  return (
    <div className="max-w-xs overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Miniatura bloqueada / desbloqueada */}
      <div className="relative h-56 w-full overflow-hidden bg-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media.url}
          alt={isVideo ? t.chat_ppv.video_label : t.chat_ppv.photo_label}
          className={cn(
            'h-full w-full object-cover transition-all duration-700 ease-in-out',
            isUnlocked ? 'scale-100 blur-0 grayscale-0' : 'scale-110 blur-2xl grayscale',
          )}
        />

        {/* Overlay do cadeado */}
        {!isUnlocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/25">
            <div className="flex size-14 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm">
              {isVideo
                ? <Play className="size-6 translate-x-0.5 text-navy" />
                : <ImageIcon className="size-6 text-navy" />
              }
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 backdrop-blur-sm">
              <Lock className="size-3 text-white" />
              <span className="text-xs font-bold tracking-widest text-white">
                {t.chat_ppv.locked_label}
              </span>
            </div>
          </div>
        )}

        {/* Badge de tipo no canto */}
        {isUnlocked && (
          <div className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            {isVideo ? '▶ Vídeo' : '📷 Foto'}
          </div>
        )}
      </div>

      {/* Texto da mensagem */}
      <div className="px-4 pt-3">
        <p className="text-sm leading-relaxed text-navy">{message.text}</p>
        {message.timeLabel && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{message.timeLabel}</p>
        )}
      </div>

      {/* Rodapé: botão de compra ou confirmação */}
      <div className="p-4 pt-3">
        {!isUnlocked ? (
          <button
            onClick={handleUnlock}
            disabled={isProcessing}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-md transition-all active:scale-[.98]',
              'bg-gradient-to-r from-gold/80 to-gold text-navy hover:opacity-90',
              isProcessing && 'cursor-wait opacity-70',
            )}
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t.chat_ppv.processing}
              </>
            ) : (
              `${t.chat_ppv.unlock_cta} ${media.price}`
            )}
          </button>
        ) : (
          <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-sm font-bold text-emerald-700">
            <CheckCircle2 className="size-4" />
            {t.chat_ppv.success_label}
          </div>
        )}

        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          🔒 {t.chat_ppv.stripe_hint}
        </p>
      </div>
    </div>
  )
}

// ─── Barra de Input do Maker (com PPV e Anexo) ───────────────────────────────
function MakerChatInput() {
  const t = useDict()
  const fileRef = useRef<HTMLInputElement>(null)

  const [message,       setMessage]       = useState('')
  const [isPPV,         setIsPPV]         = useState(false)
  const [price,         setPrice]         = useState('')
  const [fileName,      setFileName]      = useState<string | null>(null)
  const [fileSize,      setFileSize]      = useState<string | null>(null)
  const hasAttachment = fileName !== null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFileName(f.name)
    setFileSize((f.size / (1024 * 1024)).toFixed(1))
  }

  const removeAttachment = () => {
    setFileName(null)
    setFileSize(null)
    setIsPPV(false)
    setPrice('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSend = () => {
    if (!message.trim() && !hasAttachment) return
    // TODO: integrar com Supabase / broadcast API
    setMessage('')
    setPrice('')
    setIsPPV(false)
    removeAttachment()
  }

  return (
    <div className="border-t border-border bg-background px-4 py-3">

      {/* Input de arquivo oculto */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Preview do anexo */}
      {hasAttachment && (
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-border bg-secondary p-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary/80">
            <ImageIcon className="size-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-navy">{fileName}</p>
            {fileSize && (
              <p className="text-xs text-muted-foreground">{fileSize} {t.chat_input.file_size_label}</p>
            )}
          </div>
          <button
            type="button"
            onClick={removeAttachment}
            aria-label={t.chat_input.remove_attach}
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Painel PPV — aparece só com anexo + cadeado ativo */}
      {isPPV && hasAttachment && (
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-navy px-4 py-3 shadow-inner">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold/20">
            <Lock className="size-4 text-gold" />
          </div>
          <span className="flex-1 text-sm font-medium text-primary-foreground">
            {t.chat_input.ppv_locked_label}
          </span>
          {/* Campo de preço */}
          <div className="relative w-32">
            <span className="absolute inset-y-0 left-3 flex items-center text-xs font-bold text-muted-foreground">
              {t.chat_input.currency}
            </span>
            <input
              type="number"
              min="0"
              step="0.50"
              placeholder="0,00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-1.5 pl-10 pr-3 text-sm text-navy outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            />
          </div>
        </div>
      )}

      {/* Barra principal */}
      <div className="flex items-end gap-2">

        {/* Botão de anexo */}
        <button
          type="button"
          title={t.chat_input.attach_title}
          onClick={() => fileRef.current?.click()}
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full transition-colors',
            hasAttachment
              ? 'bg-secondary text-navy'
              : 'text-muted-foreground hover:bg-secondary hover:text-navy',
          )}
        >
          <Paperclip className="size-5" />
        </button>

        {/* Toggle PPV — só habilitado com anexo */}
        <button
          type="button"
          title={t.chat_input.ppv_toggle_title}
          onClick={() => setIsPPV((v) => !v)}
          disabled={!hasAttachment}
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-30',
            isPPV
              ? 'bg-gold/15 text-gold'
              : 'text-muted-foreground hover:bg-secondary hover:text-navy',
          )}
        >
          {isPPV
            ? <Lock   className="size-5" />
            : <Unlock className="size-5" />
          }
        </button>

        {/* Campo de texto */}
        <div className="flex flex-1 items-center rounded-full border border-input bg-secondary px-4 py-2.5">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={isPPV ? t.chat_input.ppv_placeholder : t.chat_input.placeholder}
            className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Botão enviar */}
        <button
          type="button"
          title={t.chat_input.send_title}
          onClick={handleSend}
          disabled={!message.trim() && !hasAttachment}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold text-navy shadow-md transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="size-4 translate-x-px" />
        </button>
      </div>
    </div>
  )
}

// ─── Painel de Broadcast de Vendas ───────────────────────────────────────────
function BroadcastPanel({ onClose }: { onClose: () => void }) {
  const t = useDict()
  const fileRef = useRef<HTMLInputElement>(null)

  const [mensagem, setMensagem] = useState('')
  const [midia, setMidia] = useState<string | null>(null)
  const [audiencia, setAudiencia] = useState<Audiencia>('todos')
  const [ppv, setPpv] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  const fieldCls =
    'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold focus:ring-1 focus:ring-gold'

  const audienciaOptions: { value: Audiencia; label: string }[] = [
    { value: 'todos',       label: t.maker_studio.broadcast_todos       },
    { value: 'assinantes',  label: t.maker_studio.broadcast_assinantes  },
    { value: 'gold',        label: t.maker_studio.broadcast_gold        },
  ]

  // Contagem simulada de destinatários por audiência
  const recipientCount: Record<Audiencia, number> = {
    todos:      14_820,
    assinantes: 3_240,
    gold:       890,
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending || done) return
    setSending(true)
    await new Promise((r) => setTimeout(r, 2000))
    setSending(false)
    setDone(true)
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-5 p-8 text-center">
        <CheckCircle2 className="size-14 text-gold" />
        <p className="font-heading text-xl text-navy">{t.maker_studio.broadcast_sucesso}</p>
        <p className="text-sm text-muted-foreground">
          {recipientCount[audiencia].toLocaleString('pt-BR')} destinatários · Pagamento PPV: US$&nbsp;
          {parseFloat(ppv || '0').toFixed(2)}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-navy hover:bg-secondary"
        >
          {t.maker_studio.broadcast_cancelar}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSend} className="flex flex-col gap-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-gold/15">
            <Radio className="size-4 text-gold" />
          </div>
          <div>
            <p className="text-sm font-bold text-navy">{t.maker_studio.broadcast_titulo}</p>
            <p className="text-xs text-muted-foreground">{t.maker_studio.broadcast_desc}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-navy"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Seletor de Audiência */}
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <Users className="size-3.5" />
          {t.maker_studio.broadcast_audiencia}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {audienciaOptions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setAudiencia(value)}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-xl border-2 py-2.5 px-2 text-center transition-all',
                audiencia === value
                  ? 'border-gold bg-gold/8 shadow-sm'
                  : 'border-border hover:border-gold/40',
              )}
            >
              <span
                className={cn(
                  'text-xs font-semibold leading-tight',
                  audiencia === value ? 'text-navy' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
              <span
                className={cn(
                  'text-[10px] font-bold tabular-nums',
                  audiencia === value ? 'text-gold' : 'text-muted-foreground/60',
                )}
              >
                {recipientCount[value].toLocaleString('pt-BR')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mensagem */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t.maker_studio.broadcast_msg_label}
        </label>
        <textarea
          required
          rows={4}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder={t.maker_studio.broadcast_msg_ph}
          className={cn(fieldCls, 'resize-none')}
        />
      </div>

      {/* Anexar Mídia */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t.maker_studio.broadcast_midia_label}
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            setMidia(f ? f.name : null)
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-3 text-sm transition-colors',
            midia
              ? 'border-gold bg-gold/5 text-gold'
              : 'border-border text-muted-foreground hover:border-gold/40 hover:text-navy',
          )}
        >
          <Paperclip className="size-4" />
          {midia ?? t.maker_studio.broadcast_midia_btn}
        </button>
      </div>

      {/* Preço de Desbloqueio (PPV) */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t.maker_studio.broadcast_ppv_label}
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="number"
            min="0"
            step="0.50"
            value={ppv}
            onChange={(e) => setPpv(e.target.value)}
            placeholder={t.maker_studio.broadcast_ppv_ph}
            className={cn(fieldCls, 'pl-9')}
          />
        </div>
        {parseFloat(ppv || '0') > 0 && (
          <p className="mt-1 text-xs text-gold">
            ✦ Conteúdo PPV — fãs pagam US$&nbsp;{parseFloat(ppv).toFixed(2)} para desbloquear.
          </p>
        )}
      </div>

      {/* Resumo antes do envio */}
      <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-xs text-muted-foreground">
        <span className="font-semibold text-navy">Resumo: </span>
        {recipientCount[audiencia].toLocaleString('pt-BR')} destinatários ·{' '}
        {midia ? `Com mídia (${midia})` : 'Sem mídia'} ·{' '}
        {parseFloat(ppv || '0') > 0 ? (
          <span className="text-gold">PPV US$ {parseFloat(ppv).toFixed(2)}</span>
        ) : (
          'Gratuito'
        )}
      </div>

      {/* Ações */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border border-border py-3 text-sm font-medium text-navy hover:bg-secondary"
        >
          {t.maker_studio.broadcast_cancelar}
        </button>
        <button
          type="submit"
          disabled={!mensagem || sending}
          className={cn(
            'flex-1 rounded-xl bg-gradient-to-r from-gold/80 to-gold py-3 text-sm font-bold text-navy shadow-md transition-opacity hover:opacity-90',
            (!mensagem || sending) && 'cursor-not-allowed opacity-50',
          )}
        >
          {sending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Enviando…
            </span>
          ) : (
            t.maker_studio.broadcast_enviar
          )}
        </button>
      </div>
    </form>
  )
}

// ─── Tela de Chat ─────────────────────────────────────────────────────────────
export function ChatScreen() {
  const { accountType } = useApp()
  const t = useDict()
  const isMaker = accountType === 'maker'
  const [active, setActive] = useState(0)
  const [blocked, setBlocked] = useState(false)
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [chatTab, setChatTab] = useState<ChatTab>('all')
  const thread = chatThreads[active]

  // Filtra mensagens com base na tab ativa
  const filteredMessages = sampleMessages.filter((m) => {
    if (chatTab === 'all') return true
    if (chatTab === 'unlocked') return m.media?.unlocked === true
    if (chatTab === 'purchased') return !!m.media
    return true
  })

  return (
    <div className="mx-auto flex h-[calc(100vh-69px)] max-w-4xl">
      {/* Lista de conversas */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-border">
        {/* Header da sidebar com botão de Broadcast (exclusivo do Maker) */}
        <div className="flex items-center justify-between px-4 py-4">
          <p className="text-sm font-semibold text-navy">Conversas</p>
          {isMaker && (
            <button
              type="button"
              onClick={() => setShowBroadcast(true)}
              title={t.maker_studio.broadcast_btn}
              className="flex items-center gap-1.5 rounded-lg border border-gold/50 bg-gold/10 px-2.5 py-1.5 text-[11px] font-bold text-navy transition-colors hover:bg-gold hover:text-navy"
            >
              <Radio className="size-3.5 text-gold" />
              Broadcast
            </button>
          )}
        </div>

        {chatThreads.map((t, i) => (
          <button
            key={t.maker.id}
            onClick={() => {
              setActive(i)
              setBlocked(false)
              setShowBroadcast(false)
            }}
            className={cn(
              'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary',
              i === active && !showBroadcast && 'bg-secondary',
            )}
          >
            <span className="relative size-10 shrink-0 overflow-hidden rounded-full">
              <Image src={t.maker.avatar} alt={t.maker.name} fill sizes="40px" className="object-cover" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-navy">{t.maker.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{t.lastMessage}</span>
            </span>
            {t.unread > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-navy">
                {t.unread}
              </span>
            )}
          </button>
        ))}
      </aside>

      {/* Área principal: Broadcast ou Conversa */}
      {showBroadcast ? (
        <section className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <BroadcastPanel onClose={() => setShowBroadcast(false)} />
        </section>
      ) : (
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="relative size-9 overflow-hidden rounded-full">
                <Image
                  src={thread.maker.avatar}
                  alt={thread.maker.name}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </span>
              <p className="text-sm font-semibold text-navy">{thread.maker.name}</p>
            </div>
            {isMaker && (
              <button
                onClick={() => setBlocked((b) => !b)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                  blocked
                    ? 'border-destructive bg-destructive/10 text-destructive'
                    : 'border-border text-navy hover:border-destructive hover:text-destructive',
                )}
              >
                <Ban className="size-3.5" />
                {blocked ? 'Espectador bloqueado' : 'Dar Block no Espectador'}
              </button>
            )}
          </header>

          {/* Tabs de filtro de mensagens (apenas para viewer) */}
          {!isMaker && (
            <div className="flex gap-1 border-b border-border bg-background px-4 py-2">
              {(
                [
                  ['all',      t.chat_ppv.tab_all],
                  ['unlocked', t.chat_ppv.tab_unlocked],
                  ['purchased', t.chat_ppv.tab_purchased],
                ] as [ChatTab, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setChatTab(key)}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-xs font-semibold transition-all',
                    chatTab === key
                      ? 'bg-navy text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-navy',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 space-y-3 overflow-y-auto bg-secondary/30 p-4">
            {filteredMessages.map((m) => (
              <div key={m.id} className={cn('flex', m.from === 'me' ? 'justify-end' : 'justify-start')}>
                {m.media && !isMaker ? (
                  <PPVMessageCard message={m} />
                ) : (
                  <div className={cn('flex flex-col', m.from === 'me' ? 'items-end' : 'items-start')}>
                    <p
                      className={cn(
                        'max-w-xs rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                        m.from === 'me'
                          ? 'bg-navy text-primary-foreground'
                          : 'border border-border bg-card text-navy',
                      )}
                    >
                      {m.text}
                    </p>
                    {m.timeLabel && (
                      <span className="mt-0.5 text-[10px] text-muted-foreground">{m.timeLabel}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {blocked ? (
            <div className="flex items-center justify-center gap-2 border-t border-border px-4 py-4 text-sm text-destructive">
              <ShieldX className="size-4" /> Você bloqueou este Espectador.
            </div>
          ) : isMaker ? (
            /* Barra avançada do Maker: anexo + toggle PPV + preço */
            <MakerChatInput />
          ) : (
            /* Barra simples do Viewer */
            <div className="flex items-center gap-2 border-t border-border px-4 py-3">
              <input
                placeholder={t.chat_input.placeholder}
                className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-gold"
              />
              <button className="flex size-10 items-center justify-center rounded-full bg-gold text-navy hover:opacity-90">
                <Send className="size-4" />
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
