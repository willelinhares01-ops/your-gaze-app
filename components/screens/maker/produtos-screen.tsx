'use client'

import { useRef, useState } from 'react'
import { Plus, ExternalLink, ShoppingCart, ImagePlus, Play, X } from 'lucide-react'
import { useDict } from '@/lib/locale-context'

type Produto = {
  id: string
  nome: string
  loja: string
  url: string
  midiaUrl?: string
  midiaTipo?: 'foto' | 'video'
}

const iniciais: Produto[] = [
  { id: 'p1', nome: 'Iluminador dourado',     loja: 'Loja parceira', url: '#', midiaUrl: '/post-2.png', midiaTipo: 'foto' },
  { id: 'p2', nome: 'Ring light profissional', loja: 'Loja parceira', url: '#', midiaUrl: '/post-3.png', midiaTipo: 'foto' },
]

export function ProdutosScreen() {
  const t = useDict()
  const [produtos, setProdutos] = useState<Produto[]>(iniciais)
  const [nome, setNome] = useState('')
  const [loja, setLoja] = useState('')
  const [midiaUrl, setMidiaUrl] = useState<string>()
  const [midiaTipo, setMidiaTipo] = useState<'foto' | 'video'>()
  const [erro, setErro] = useState<string>()
  const fileRef = useRef<HTMLInputElement>(null)

  const escolherMidia = (file: File) => {
    setErro(undefined)
    const url = URL.createObjectURL(file)
    if (file.type.startsWith('video/')) {
      const v = document.createElement('video')
      v.preload = 'metadata'
      v.onloadedmetadata = () => {
        if (v.duration > 10.5) {
          URL.revokeObjectURL(url)
          setErro(t.maker_studio.prod_erro_duracao)
          return
        }
        setMidiaUrl(url)
        setMidiaTipo('video')
      }
      v.src = url
    } else if (file.type.startsWith('image/')) {
      setMidiaUrl(url)
      setMidiaTipo('foto')
    } else {
      setErro(t.maker_studio.prod_erro_formato)
    }
  }

  const limparMidia = () => {
    setMidiaUrl(undefined)
    setMidiaTipo(undefined)
    if (fileRef.current) fileRef.current.value = ''
  }

  const add = () => {
    if (!nome.trim()) return
    setProdutos((p) => [
      ...p,
      {
        id: crypto.randomUUID(),
        nome,
        loja: loja.trim() || t.maker_studio.prod_loja_default,
        url: '#',
        midiaUrl,
        midiaTipo,
      },
    ])
    setNome('')
    setLoja('')
    limparMidia()
  }

  return (
    <div className="px-6 py-8">
      <header className="mb-6">
        <h2 className="font-heading text-2xl text-navy">{t.maker_studio.prod_title}</h2>
        <p className="text-sm text-muted-foreground">{t.maker_studio.prod_subtitle}</p>
      </header>

      {/* Formulário de adição */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          {/* Upload de mídia do produto */}
          <div className="shrink-0">
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) escolherMidia(f)
              }}
            />
            {midiaUrl ? (
              <div className="relative size-24 overflow-hidden rounded-lg border border-border">
                {midiaTipo === 'video' ? (
                  <video src={midiaUrl} className="size-full object-cover" muted playsInline />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={midiaUrl} alt={t.maker_studio.prod_midia_previa} className="size-full object-cover" />
                )}
                <button
                  onClick={limparMidia}
                  className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-navy/80 text-background"
                  aria-label={t.maker_studio.prod_remover_midia}
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex size-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-input text-muted-foreground hover:border-gold hover:text-gold"
              >
                <ImagePlus className="size-5" />
                <span className="text-[10px] leading-tight">{t.maker_studio.prod_midia_label}</span>
              </button>
            )}
          </div>

          {/* Campos de texto + botão */}
          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder={t.maker_studio.prod_nome_ph}
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
            />
            <input
              value={loja}
              onChange={(e) => setLoja(e.target.value)}
              placeholder={t.maker_studio.prod_loja_ph}
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
            />
            <button
              onClick={add}
              className="flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-navy hover:opacity-90"
            >
              <Plus className="size-4" /> {t.maker_studio.prod_adicionar}
            </button>
          </div>
        </div>
        {erro && <p className="mt-2 text-xs text-destructive">{erro}</p>}
      </div>

      {/* Grade de produtos */}
      <ul className="grid gap-4 sm:grid-cols-2">
        {produtos.map((p) => (
          <li key={p.id} className="overflow-hidden rounded-xl border border-border bg-card">
            {/* Mídia do produto */}
            <div className="relative aspect-video w-full bg-secondary">
              {p.midiaUrl ? (
                p.midiaTipo === 'video' ? (
                  <>
                    <video src={p.midiaUrl} className="size-full object-cover" muted playsInline />
                    <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-navy/80 px-2 py-0.5 text-xs font-medium text-gold">
                      <Play className="size-3" fill="currentColor" /> 0:10
                    </span>
                  </>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.midiaUrl} alt={p.nome} className="size-full object-cover" />
                )
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <ShoppingCart className="size-8" />
                </div>
              )}
            </div>

            {/* Nome, loja e link */}
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-navy">{p.nome}</p>
                <p className="text-xs text-muted-foreground">{p.loja}</p>
              </div>
              <a
                href={p.url}
                className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-navy hover:bg-gold"
                aria-label={`${t.maker_studio.prod_abrir_link} ${p.nome}`}
              >
                {t.maker_studio.prod_comprar} <ExternalLink className="size-3.5" />
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
