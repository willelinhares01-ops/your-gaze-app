'use client'

/**
 * AdminGuard — Camada de proteção militar para o Backoffice "God Mode".
 *
 * Política de acesso (AND obrigatório — ambas devem ser verdadeiras):
 *   1. isAdminEligible — e-mail do usuário logado corresponde a NEXT_PUBLIC_ADMIN_EMAIL.
 *                        Derivado em tempo de execução; nunca persistido em localStorage.
 *   2. isAdmin         — token mestre foi validado nesta sessão via enterAdmin(token).
 *                        Redefinido como `false` em cada novo carregamento de página.
 *
 * Comportamento em caso de falha:
 *   - Renderização nula imediata (sem flash de conteúdo protegido).
 *   - Redirecionamento silencioso para 'feed' via useEffect (sem tela de erro).
 *   - Aviso de auditoria no console para rastreamento interno.
 *
 * Uso:
 *   <AdminGuard>
 *     <AdminScreen />
 *   </AdminGuard>
 */

import { useEffect, type ReactNode } from 'react'
import { useApp } from '@/components/app-context'

interface AdminGuardProps {
  children: ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAdmin, isAdminEligible, navigate } = useApp()

  const authorized = isAdmin && isAdminEligible

  useEffect(() => {
    if (!authorized) {
      console.warn(
        '[AdminGuard] Acesso não autorizado — redirecionando silenciosamente para feed.',
        { isAdmin, isAdminEligible },
      )
      navigate('feed')
    }
    // Reavalia sempre que o estado de autorização mudar (ex: logout, expiração de sessão).
  }, [authorized, isAdmin, isAdminEligible, navigate])

  // Null imediato — sem flash de conteúdo protegido enquanto o efeito processa.
  if (!authorized) return null

  return <>{children}</>
}
