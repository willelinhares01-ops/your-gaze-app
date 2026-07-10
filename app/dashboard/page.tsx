'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

/**
 * Rota de destino após o onboarding bem-sucedido.
 * Aguarda 3 s e redireciona para a raiz, onde o AppProvider
 * restaura screen='app' a partir do localStorage.
 */
export default function DashboardPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const total = 3000
    const raf = () => {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / total) * 100, 100)
      setProgress(pct)
      if (pct < 100) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
    const t = setTimeout(() => router.replace('/'), total)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <CheckCircle className="h-16 w-16 text-[#D4AF37]" />
      <h1 className="text-2xl font-bold text-navy">Cadastro Confirmado!</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Bem-vindo(a) à <span className="font-semibold text-navy">YOUR GAZE</span>. Sua conta foi
        criada com sucesso. Redirecionando para o app…
      </p>
      <div className="h-1 w-48 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-[#D4AF37] transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
