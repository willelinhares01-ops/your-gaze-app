'use client'

import { useState } from 'react'
import { UploadCloud, Image as ImageIcon, Video, Music } from 'lucide-react'

export function UploadScreen() {
  const [drag, setDrag] = useState(false)

  return (
    <div className="px-6 py-8">
      <header className="mb-6">
        <h2 className="font-heading text-2xl text-navy">Gerenciador de Upload</h2>
        <p className="text-sm text-muted-foreground">Solte fotos, vídeos ou áudios — até 2GB por arquivo.</p>
      </header>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDrag(false)
        }}
        className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-16 text-center transition-colors ${
          drag ? 'border-gold bg-gold/5' : 'border-navy/30'
        }`}
      >
        <span className="flex size-16 items-center justify-center rounded-full bg-gold/15 text-gold">
          <UploadCloud className="size-8" />
        </span>
        <p className="text-sm font-medium text-navy">Arraste seus arquivos aqui</p>
        <p className="text-xs text-muted-foreground">ou</p>
        <button className="rounded-xl bg-navy px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          Selecionar arquivos
        </button>
        <div className="mt-4 flex gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><ImageIcon className="size-4" /> Fotos</span>
          <span className="flex items-center gap-1.5"><Video className="size-4" /> Vídeos</span>
          <span className="flex items-center gap-1.5"><Music className="size-4" /> Áudios</span>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-4 font-heading text-lg text-navy">Uploads recentes</h3>
        <ul className="divide-y divide-border">
          {[
            { name: 'ensaio-dourado.mp4', size: '1.2 GB', tipo: 'Vídeo' },
            { name: 'editorial-azul.jpg', size: '8 MB', tipo: 'Foto' },
            { name: 'podcast-ep03.mp3', size: '64 MB', tipo: 'Áudio' },
          ].map((f) => (
            <li key={f.name} className="flex items-center justify-between py-3 text-sm">
              <span className="text-navy">{f.name}</span>
              <span className="text-muted-foreground">{f.tipo} · {f.size}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
