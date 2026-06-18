'use client'

import { AppProvider, useApp } from '@/components/app-context'
import { Sidebar } from '@/components/sidebar'
import { ReducedHeader } from '@/components/reduced-header'
import { Landing } from '@/components/screens/landing'
import { Onboarding } from '@/components/screens/onboarding'
import { FeedScreen } from '@/components/screens/feed-screen'
import { DegustacaoScreen } from '@/components/screens/degustacao-screen'
import { ChatScreen } from '@/components/screens/chat-screen'
import { AssinaturasScreen } from '@/components/screens/assinaturas-screen'
import { TransmissaoScreen } from '@/components/screens/transmissao-screen'
import { MetricasScreen } from '@/components/screens/maker/metricas-screen'
import { UploadScreen } from '@/components/screens/maker/upload-screen'
import { PrecificacaoScreen } from '@/components/screens/maker/precificacao-screen'
import { LivesScreen } from '@/components/screens/maker/lives-screen'
import { IndicacoesScreen } from '@/components/screens/maker/indicacoes-screen'
import { ProdutosScreen } from '@/components/screens/maker/produtos-screen'
import { SettingsScreen, SupportScreen } from '@/components/screens/simple-screen'
import { AdminScreen } from '@/components/screens/admin-screen'

function Router() {
  const { screen, page, isAdmin } = useApp()

  if (screen === 'landing') return <Landing />
  if (screen === 'onboarding') return <Onboarding />

  // Backoffice ocupa a tela inteira quando ativo.
  if (isAdmin) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1">
          <ReducedHeader />
          <AdminScreen />
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
        {page === 'transmissao' && <TransmissaoScreen />}
        {page === 'metricas' && <MetricasScreen />}
        {page === 'upload' && <UploadScreen />}
        {page === 'precificacao' && <PrecificacaoScreen />}
        {page === 'lives' && <LivesScreen />}
        {page === 'indicacoes' && <IndicacoesScreen />}
        {page === 'produtos' && <ProdutosScreen />}
        {page === 'config' && <SettingsScreen />}
        {page === 'suporte' && <SupportScreen />}
      </main>
    </div>
  )
}

export function YourGazeApp() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}
