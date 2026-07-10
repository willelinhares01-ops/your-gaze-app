'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { LocaleProvider } from '@/lib/locale-context'
import { AppProvider, useApp } from '@/components/app-context'
import { AdminGuard } from '@/components/admin-guard'
import { Sidebar } from '@/components/sidebar'
import { ReducedHeader } from '@/components/reduced-header'
import { Landing } from '@/components/screens/landing'
import { Login } from '@/components/screens/login'
import { Onboarding } from '@/components/screens/onboarding'
import { MakerOnboarding } from '@/components/screens/maker-onboarding'
import { FeedScreen } from '@/components/screens/feed-screen'
import { DegustacaoScreen } from '@/components/screens/degustacao-screen'
import { ChatScreen } from '@/components/screens/chat-screen'
import { AssinaturasScreen } from '@/components/screens/assinaturas-screen'
import { CursosScreen } from '@/components/screens/cursos-screen'
import { TransmissaoScreen } from '@/components/screens/transmissao-screen'
import { MetricasScreen } from '@/components/screens/maker/metricas-screen'
import { UploadScreen } from '@/components/screens/maker/upload-screen'
import { PrecificacaoScreen } from '@/components/screens/maker/precificacao-screen'
import { LivesScreen } from '@/components/screens/maker/lives-screen'
import { IndicacoesScreen } from '@/components/screens/maker/indicacoes-screen'
import { ProdutosScreen } from '@/components/screens/maker/produtos-screen'
import { PerfilScreen } from '@/components/screens/maker/perfil-screen'
import { DashboardScreen } from '@/components/screens/maker/dashboard-screen'
import { PayoutEngine } from '@/components/screens/maker/payout-engine'
import { SettingsScreen, SupportScreen } from '@/components/screens/simple-screen'
import { AdminScreen } from '@/components/screens/admin-screen'

/**
 * useCheckoutSuccess — detecta o retorno da Stripe Checkout Session.
 *
 * Quando o Stripe redireciona de volta para o app com ?checkout_success=1&maker_id=xxx,
 * este hook captura os params, libera o conteúdo granularmente chamando subscribeTo(makerId),
 * e limpa a URL para não re-disparar em reloads.
 */
function useCheckoutSuccess() {
  const params = useSearchParams()
  const router = useRouter()
  const { subscribeTo, navigate } = useApp()

  useEffect(() => {
    const success = params.get('checkout_success')
    const makerId = params.get('maker_id')

    if (success === '1' && makerId) {
      subscribeTo(makerId)
      navigate('feed')
      // Remove os query params da URL sem adicionar ao histórico
      router.replace('/app', { scroll: false })
    }
  // Executa apenas uma vez na montagem — params estáveis do Next.js
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

function Router() {
  const { screen, page, isAdmin, accountType } = useApp()
  useCheckoutSuccess()

  if (screen === 'landing') return <Landing />
  if (screen === 'login') return <Login />
  if (screen === 'onboarding' && accountType === 'maker') return <MakerOnboarding />
  if (screen === 'onboarding') return <Onboarding />

  // Backoffice — protegido pelo AdminGuard (dupla verificação: token + e-mail).
  if (isAdmin) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1">
          <ReducedHeader />
          <AdminGuard>
            <AdminScreen />
          </AdminGuard>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1">
        <ReducedHeader />
        {page === 'feed' && <FeedScreen />}
        {page === 'degustacao' && <DegustacaoScreen />}
        {page === 'chat' && <ChatScreen />}
        {page === 'assinaturas' && <AssinaturasScreen />}
        {page === 'cursos' && <CursosScreen />}
        {page === 'transmissao' && <TransmissaoScreen />}
        {page === 'metricas' && <MetricasScreen />}
        {page === 'dashboard' && <DashboardScreen />}
        {page === 'payout' && <PayoutEngine />}
        {page === 'upload' && <UploadScreen />}
        {page === 'precificacao' && <PrecificacaoScreen />}
        {page === 'lives' && <LivesScreen />}
        {page === 'indicacoes' && <IndicacoesScreen />}
        {page === 'produtos' && <ProdutosScreen />}
        {page === 'perfil' && <PerfilScreen />}
        {page === 'config' && <SettingsScreen />}
        {page === 'suporte' && <SupportScreen />}
      </main>
    </div>
  )
}

export function YourGazeApp() {
  return (
    // initial="en" → inglês como padrão temporário para testes.
    // Trocar para "pt" antes do lançamento em produção.
    <LocaleProvider initial="en">
      <AppProvider>
        {/* Suspense necessário porque Router usa useSearchParams (Next.js 14+) */}
        <Suspense>
          <Router />
        </Suspense>
      </AppProvider>
    </LocaleProvider>
  )
}
