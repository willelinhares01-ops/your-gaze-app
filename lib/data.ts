export type Maker = {
  id: string
  name: string
  handle: string
  avatar: string
  /** Marca Makers recém-ingressadas — alimenta a aba "Novatos" do feed */
  isRookie?: boolean
  /**
   * Número de registro sequencial na plataforma (1-based, atribuído no cadastro).
   * Makers com founderNumber <= 1000 são **Makers Fundadores**:
   *   • Recebem o anel de Ouro Canônico no avatar.
   *   • Ganham 2% fixos vitalícios de MGM sobre cada venda dos seus indicados,
   *     pagos diretamente da fatia de 15% da plataforma.
   * Makers com founderNumber > 1000 renderizam foto de perfil limpa (sem anel).
   */
  founderNumber?: number
  /**
   * Bio pública exibida no perfil do Maker.
   * Conta Oficial Your Gaze (#0001): "Conta Oficial & Sandbox..."
   */
  bio?: string
  /**
   * Status da verificação de identidade (KYC) via Yoti.
   *
   * - `'PENDING'`  → Maker cadastrado mas ainda não verificado. Saques bloqueados.
   * - `'VERIFIED'` → Biometria + documento aprovados. Saques em USD liberados.
   * - `'REJECTED'` → Verificação reprovada. Maker deve reabrir processo com suporte.
   *
   * Atualizado pelo webhook Yoti após `onComplianceApproved` no front-end.
   */
  kycStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED'
  /**
   * Receita de anúncios de Degustação (USD) atribuída a este Maker no mês.
   * Calculada pelo Ads Engine: 15% da receita de exibição dos conteúdos gratuitos.
   * Visível apenas no backoffice admin.
   */
  adRevenueUSD?: number
}

// ─── Viewer ───────────────────────────────────────────────────────────────────

export type Viewer = {
  name: string
  handle: string
  avatar: string
  role: 'Espectador'

  // ── Gamificação "Espectador Fiel" ──────────────────────────────────────────

  /**
   * Acumulado de gastos do mês corrente em assinaturas, mimos e PPV (USD).
   * Atualizado em tempo real pelo motor financeiro após cada transação.
   */
  monthlySpendUSD?: number

  /**
   * Meta mensal em USD definida pelo Maker para conceder o selo "Fiel do Mês".
   * Quando ausente, assume o default global da plataforma.
   */
  fielStatusTargetUSD?: number

  /**
   * Flag computada: `monthlySpendUSD >= fielStatusTargetUSD`.
   * Quando `true`, ativa o anel de ouro branco com diamantes vermelhos no avatar
   * e exibe o badge "Fiel do Mês" no perfil do Espectador.
   */
  isFielDoMes?: boolean

  /**
   * Contador de meses consecutivos (0–12) em que o Espectador bateu a meta.
   * Cada mês bem-sucedido adiciona +1 diamante ao perfil.
   */
  diamantesAcumulados?: number

  /**
   * Ativada automaticamente quando `diamantesAcumulados === 12` (ano completo).
   * Libera o prêmio físico/digital VIP configurado pelo Maker (ex: produto
   * autografado, acesso vitalício a curso, sessão 1:1 exclusiva).
   */
  unlockedAnualReward?: boolean
}

export const currentUser: Viewer = {
  name: 'Você',
  handle: '@voce',
  avatar: '/avatar-user.png',
  role: 'Espectador',
  // ── Mock de gamificação — permite testar o visual do anel dourado ───────────
  monthlySpendUSD:      127.80,   // acima da meta → isFielDoMes: true
  fielStatusTargetUSD:  100,      // meta mensal definida pelo Maker (USD)
  isFielDoMes:          true,     // 127.80 >= 100
  diamantesAcumulados:  4,        // 4 meses consecutivos atingidos (de 12)
  unlockedAnualReward:  false,    // requer 12 meses para desbloquear
}

// Maker logado na visão "Maker" (Feed & Histórico mostra apenas os posts dele)
export const currentMaker: Maker = {
  id: 'm1',
  name: 'Valentina',
  handle: '@valentina',
  avatar: '/avatar-maker-1.png',
  founderNumber: 1,    // Maker Fundadora #1 — anel de Ouro Canônico + 2% MGM vitalício
  kycStatus: 'VERIFIED', // verificada — saques em USD liberados
}

export const makers: Maker[] = [
  /**
   * Conta Oficial Your Gaze — #0001 (reserva pré-produção da plataforma).
   * founderNumber: 1 → anel Maker Fundador de Ouro Canônico ativo.
   */
  {
    id:           'maker-0001',
    name:         'Your Gaze Hub',
    handle:       '@YourGazeHub',
    avatar:       '/avatar-official.png',
    founderNumber: 1,
    bio:          'Conta Oficial & Sandbox de Testes do Ecossistema Your Gaze. Showcases, Novidades e Podcast Oficial.',
    kycStatus:    'VERIFIED',
    adRevenueUSD: 145.50,
  },
  { id: 'm1', name: 'Valentina', handle: '@valentina', avatar: '/avatar-maker-1.png', founderNumber: 1                },
  { id: 'm2', name: 'Aurora',    handle: '@aurora',    avatar: '/avatar-maker-2.png', founderNumber: 2                },
  { id: 'm3', name: 'Celeste',   handle: '@celeste',   avatar: '/avatar-maker-3.png', founderNumber: 3                },
  { id: 'm4', name: 'Bianca',    handle: '@bianca',    avatar: '/avatar-maker-4.png', founderNumber: 4, isRookie: true },
  { id: 'm5', name: 'Lívia',     handle: '@livia',     avatar: '/avatar-maker-5.png', founderNumber: 5, isRookie: true },
  // ── Perfis Convidados de Teste — rotas dinâmicas /[handle] ───────────────────
  {
    id:           'maker-0002',
    name:         'Valéria Art',
    handle:       '@ValeriaArt',
    avatar:       '/avatar-valeria.png',
    founderNumber: 2,
    kycStatus:    'VERIFIED' as const,
    bio:          'Artista visual e leiloeira de obras exclusivas.',
  },
  {
    id:           'maker-0003',
    name:         'Marcus Performance',
    handle:       '@CoachMarcus',
    avatar:       '/avatar-marcus.png',
    founderNumber: 3,
    kycStatus:    'VERIFIED' as const,
    bio:          'Estrategista de alta performance esportiva e treinos sob demanda.',
  },
  {
    id:           'maker-0004',
    name:         'Elena Music',
    handle:       '@ElenaMusic',
    avatar:       '/avatar-elena.png',
    founderNumber: 4,
    kycStatus:    'PENDING' as const,
    bio:          'Compositora e produtora. Bastidores musicais e conteúdo inédito.',
  },
]

export type Post = {
  id: string
  maker: Maker
  image: string
  caption: string
  likes: number
  tier: 'Premium' | 'Premium Gold' | 'Premium Diamond'
  // photo | video — usado pelos filtros de mídia do feed
  mediaType: 'photo' | 'video'
  // views = quantas vezes a postagem foi vista (ranqueia "Em Alta")
  views: number
  // sales = assinaturas + conteúdos avulsos que esta postagem ajudou a vender
  sales: number
  // minutos atrás da publicação (quanto menor, mais recente — ranqueia "Recente")
  minsAgo: number
  /**
   * Leilão de Mimos (Crowdfunding de VOD):
   * Quando presente, o vídeo fica bloqueado até `arrecadado >= alvo`.
   * O feed exibe uma barra de progresso dourada com CTA de envio de mimo.
   */
  mimoMeta?: {
    alvo: number         // meta total em USD
    arrecadado: number   // valor já arrecadado em USD
  }
  /**
   * Leilão Competitivo (1/1 Exclusive Auction):
   * Conteúdo de peça única — o maior lance vence e leva o arquivo exclusivo.
   * Diferente do mimoMeta (crowdfunding coletivo), aqui é um único vencedor.
   */
  leilaoCompetitivo?: {
    titulo: string
    lanceAtual: number        // lance atual em USD
    incrementoMinimo: number  // incremento mínimo por lance
    minsLeft: number          // minutos restantes (usado pelo countdown)
    totalLances: number       // número de lances dados
    isExclusivo11: boolean    // verdadeiro quando é peça única (1/1)
  }
  /**
   * Enquete Rápida (Estúdio de Votações):
   * Quando presente, o card exibe UI de votação interativa em vez de imagem.
   */
  enquete?: {
    pergunta: string
    opcoes: Array<{
      id: string
      texto: string
      votos: number
    }>
    duracao: '24h' | '3d' | '7d'
    encerrada?: boolean
  }
}

export const posts: Post[] = [
  {
    id: 'p1',
    maker: makers[0],
    image: '/post-1.png',
    caption: 'Editorial exclusivo da semana.',
    likes: 1284,
    tier: 'Premium Gold',
    mediaType: 'photo',
    views: 48200,
    sales: 312,
    minsAgo: 95,
  },
  {
    id: 'p2',
    maker: makers[2],
    image: '/post-2.png',
    caption: 'Detalhes que só você enxerga.',
    likes: 932,
    tier: 'Premium',
    mediaType: 'video',
    views: 21500,
    sales: 86,
    minsAgo: 12,
  },
  {
    id: 'p3',
    maker: makers[3],
    image: '/post-3.png',
    caption: 'Bastidores do novo ensaio.',
    likes: 2150,
    tier: 'Premium Diamond',
    mediaType: 'video',
    views: 73900,
    sales: 540,
    minsAgo: 240,
  },
  {
    id: 'p4',
    maker: makers[0],
    image: '/post-2.png',
    caption: 'Clique dourado que vira capa.',
    likes: 1760,
    tier: 'Premium Diamond',
    mediaType: 'photo',
    views: 61200,
    sales: 421,
    minsAgo: 5,
  },
  {
    id: 'p5',
    maker: makers[0],
    image: '/post-3.png',
    caption: 'Prévia do conteúdo avulso de hoje.',
    likes: 640,
    tier: 'Premium',
    mediaType: 'photo',
    views: 12800,
    sales: 58,
    minsAgo: 30,
  },
  // ── Enquete Rápida — Estúdio de Votações (Valentina) ─────────────────────
  {
    id: 'p9',
    maker: makers[0],           // Valentina
    image: '/placeholder.svg',
    caption: '',
    likes: 0,
    tier: 'Premium',
    mediaType: 'photo',
    views: 0,
    sales: 0,
    minsAgo: 3,
    enquete: {
      pergunta: 'Qual conteúdo você quer ver primeiro? 🔥',
      opcoes: [
        { id: 'o1', texto: 'Ensaio de verão ☀️',        votos: 842 },
        { id: 'o2', texto: 'Bastidores da live 🎥',      votos: 531 },
        { id: 'o3', texto: 'Tutorial de maquiagem 💄',   votos: 317 },
      ],
      duracao: '3d',
    },
  },
  // ── Leilão de Mimos — crowdfunding de VOD (Aurora) ───────────────────────
  {
    id: 'p8',
    maker: makers[1],           // Aurora
    image: '/post-3.png',
    caption: 'Ensaio em câmera lenta que nunca foi revelado. Só sai quando a meta for batida 💎',
    likes: 0,
    tier: 'Premium',
    mediaType: 'video',
    views: 14200,
    sales: 0,
    minsAgo: 60,
    mimoMeta: { alvo: 500, arrecadado: 317 },
  },
  // ── Leilão Competitivo 1/1 — exclusive auction (Valentina) ──────────────
  {
    id: 'p10',
    maker: makers[0],           // Valentina
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop',
    caption: 'Bastidores inéditos — esta peça única vai ao maior lance.',
    likes: 489,
    tier: 'Premium Diamond',
    mediaType: 'video',
    views: 31200,
    sales: 0,
    minsAgo: 45,
    leilaoCompetitivo: {
      titulo:            'Vídeo Exclusivo: Bastidores Inéditos — Peça Única',
      lanceAtual:        150,
      incrementoMinimo:  10,
      minsLeft:          135,   // ≈ 02:15:00
      totalLances:       23,
      isExclusivo11:     true,
    },
  },
  // ── Posts de Novatas — aba "Novatos" ──────────────────────────────────────
  {
    id: 'p6',
    maker: makers[3],           // Bianca — isRookie
    image: '/post-1.png',
    caption: 'Meu primeiro ensaio aqui. Bem-vindas ao meu universo ✨',
    likes: 203,
    tier: 'Premium',
    mediaType: 'photo',
    views: 4100,
    sales: 9,
    minsAgo: 18,
  },
  {
    id: 'p7',
    maker: makers[4],           // Lívia — isRookie
    image: '/post-2.png',
    caption: 'Chegando com tudo! Conteúdo novo toda semana 💎',
    likes: 87,
    tier: 'Premium',
    mediaType: 'video',
    views: 2300,
    sales: 4,
    minsAgo: 7,
  },
  // ── Posts dos Perfis Convidados de Teste ──────────────────────────────────────
  {
    id: 'p11',
    maker: makers[6],           // @ValeriaArt — leilão de obra exclusiva
    image: '/post-1.png',
    caption: 'Obra em acrílico 90×120 cm — peça única certificada. O maior lance leva.',
    likes: 742,
    tier: 'Premium Diamond',
    mediaType: 'photo',
    views: 28400,
    sales: 0,
    minsAgo: 55,
    leilaoCompetitivo: {
      titulo:           'Obra Original: "Olhar Soberano" — Peça Única Certificada',
      lanceAtual:       250,
      incrementoMinimo: 25,
      minsLeft:         310,    // ≈ 05:10:00
      totalLances:      14,
      isExclusivo11:    true,
    },
  },
  {
    id: 'p12',
    maker: makers[6],           // @ValeriaArt — PPV fotografia
    image: '/post-2.png',
    caption: 'Bastidores do ateliê: série de aquarelas nunca mostradas.',
    likes: 318,
    tier: 'Premium Gold',
    mediaType: 'photo',
    views: 11200,
    sales: 37,
    minsAgo: 120,
  },
  {
    id: 'p13',
    maker: makers[7],           // @CoachMarcus — PPV vídeo de treino
    image: '/post-3.png',
    caption: 'Protocolo de força completo — 4 semanas de periodização avançada.',
    likes: 1104,
    tier: 'Premium Gold',
    mediaType: 'video',
    views: 34700,
    sales: 218,
    minsAgo: 40,
  },
  {
    id: 'p14',
    maker: makers[7],           // @CoachMarcus — enquete de pauta
    image: '/placeholder.svg',
    caption: '',
    likes: 0,
    tier: 'Premium',
    mediaType: 'video',
    views: 0,
    sales: 0,
    minsAgo: 15,
    enquete: {
      pergunta: 'Qual protocolo você quer ver na próxima live? 🏋️',
      opcoes: [
        { id: 'e1', texto: 'Força máxima (1RM)',           votos: 634 },
        { id: 'e2', texto: 'Hipertrofia em 30 min',        votos: 487 },
        { id: 'e3', texto: 'Mobilidade para atletas',      votos: 209 },
      ],
      duracao: '24h',
    },
  },
  {
    id: 'p15',
    maker: makers[8],           // @ElenaMusic — mimo coletivo para liberar faixa
    image: '/post-2.png',
    caption: 'Faixa inédita gravada ao vivo no estúdio. A comunidade decide quando sai 🎵',
    likes: 0,
    tier: 'Premium',
    mediaType: 'video',
    views: 9800,
    sales: 0,
    minsAgo: 90,
    mimoMeta: { alvo: 300, arrecadado: 187 },
  },
  {
    id: 'p16',
    maker: makers[8],           // @ElenaMusic — vídeo de bastidores
    image: '/post-3.png',
    caption: 'Session de composição: como nasceu o single que viralizou no underground.',
    likes: 556,
    tier: 'Premium Gold',
    mediaType: 'video',
    views: 19300,
    sales: 72,
    minsAgo: 200,
  },
]

export const tiers = [
  {
    id: 'free',
    name: 'Espectador Grátis',
    price: 'USD $0.00',
    perks: ['Aba Degustação desbloqueada', 'Fotos e vídeos até 20s', 'Compras avulsas via Chat PPV'],
  },
  {
    id: 'premium',
    name: 'Fiel Espectador Premium',
    price: 'USD $3.99 – $19.99',
    perks: ['10 a 20 vídeos (10s – 10min)', 'Até 50 fotos exclusivas', 'Chat direto com o Maker'],
  },
  {
    id: 'gold',
    name: 'Fiel Espectador Gold',
    price: 'USD $19.99 – $39.99',
    perks: ['20 a 30 vídeos completos', 'Até 100 fotos exclusivas', 'Lives e Grupos VIP'],
  },
  {
    id: 'diamond',
    name: 'Fiel Espectador Diamond',
    price: 'USD $49.00 – $199.99',
    perks: ['Acesso completo (30 a 50 vídeos)', 'PPV ilimitado incluído', 'Suporte Prioritário VIP 1:1'],
  },
  {
    id: 'courses',
    name: 'Cursos & Infoprodutos',
    price: 'USD $19.00 – $199.99',
    perks: ['Acesso vitalício ou anual', 'Revistas digitais exclusivas', 'Cursos e tutoriais do Maker'],
  },
] as const

export const interesses = [
  'Moda',
  'Beleza',
  'Fitness',
  'Lifestyle',
  'Arte',
  'Música',
  'Viagens',
  'Gastronomia',
]

export const nacionalidades = [
  'Brasil',
  'Portugal',
  'Estados Unidos',
  'Espanha',
  'França',
  'Itália',
  'Reino Unido',
  'Outro',
]

// 11 fontes de receita do Maker (lucro líquido 85%)
export const fontesReceita = [
  { nome: 'Assinaturas', valor: 18240, pct: 32 },
  { nome: 'PPV (Pay-per-view)', valor: 9120, pct: 16 },
  { nome: 'Fotos avulsas', valor: 6840, pct: 12 },
  { nome: 'Gorjetas', valor: 5700, pct: 10 },
  { nome: 'Lives', valor: 5130, pct: 9 },
  { nome: 'Gamificação', valor: 3990, pct: 7 },
  { nome: 'Grupos VIP', valor: 2850, pct: 5 },
  { nome: 'Podcasts', valor: 2280, pct: 4 },
  { nome: 'Mensagens combo', valor: 1710, pct: 3 },
  { nome: 'Indicações MGM', valor: 1140, pct: 2 },
  { nome: 'Lista de produtos', valor: 0, pct: 0 },
]

export const salesByMonth = [
  { mes: 'Jan', valor: 32 },
  { mes: 'Fev', valor: 41 },
  { mes: 'Mar', valor: 38 },
  { mes: 'Abr', valor: 52 },
  { mes: 'Mai', valor: 49 },
  { mes: 'Jun', valor: 64 },
]

export type ChatMessage = {
  id: string
  from: 'maker' | 'me'
  text: string
  timeLabel?: string
  /** Se presente, a mensagem é um PPV. `url` é a mídia bloqueada. */
  media?: {
    price: string
    /** URL pública para o preview desfocado. */
    url: string
    type: 'photo' | 'video'
    /** Se true, o viewer já desbloqueou — não exibe o paywall. */
    unlocked?: boolean
  }
}

export const chatThreads = makers.slice(0, 3).map((m, i) => ({
  maker: m,
  lastMessage: ['Oi! Tenho novidades pra você 💎', 'Veja meu novo PPV', 'Bom dia, amor!'][i],
  unread: [2, 0, 1][i],
}))

// ─── Admin — Transações Globais ───────────────────────────────────────────────

export type AdminTransaction = {
  id: string
  /** Descrição legível da transação (ex: "PPV desbloqueado", "Assinatura Gold") */
  description: string
  /** Handle do Maker beneficiário */
  makerHandle: string
  /** Handle do Espectador que realizou a compra */
  viewerHandle: string
  /** Tipo de produto monetizado */
  type: 'subscription' | 'ppv' | 'auction' | 'mimo'
  /** Valor bruto total em USD */
  grossUSD: number
  /** Repasse ao Maker (85%) */
  makerShareUSD: number
  /** Retenção da plataforma (15%) */
  platformShareUSD: number
  /** ISO 8601 timestamp */
  timestamp: string
}

function split(gross: number) {
  return {
    grossUSD:         gross,
    makerShareUSD:    parseFloat((gross * 0.85).toFixed(2)),
    platformShareUSD: parseFloat((gross * 0.15).toFixed(2)),
  }
}

export const adminTransactions: AdminTransaction[] = [
  {
    id: 'tx-001',
    description: 'Leilão 1/1 — Bastidores Inéditos (Peça Única)',
    makerHandle: '@YourGazeHub',
    viewerHandle: '@espectador_sandbox',
    type: 'auction',
    ...split(150.00),
    timestamp: '2026-07-07T02:14:00Z',
  },
  {
    id: 'tx-002',
    description: 'Assinatura Fiel Espectador Gold — @valentina',
    makerHandle: '@valentina',
    viewerHandle: '@espectador_sandbox',
    type: 'subscription',
    ...split(29.99),
    timestamp: '2026-07-07T01:55:00Z',
  },
  {
    id: 'tx-003',
    description: 'PPV desbloqueado — Bastidores do ensaio de hoje',
    makerHandle: '@valentina',
    viewerHandle: '@luiz_vip',
    type: 'ppv',
    ...split(29.90),
    timestamp: '2026-07-07T01:32:00Z',
  },
  {
    id: 'tx-004',
    description: 'Mimo Coletivo — Meta de Live @aurora (Lírio Rosa)',
    makerHandle: '@aurora',
    viewerHandle: '@carol_fiel',
    type: 'mimo',
    ...split(50.00),
    timestamp: '2026-07-07T00:48:00Z',
  },
  {
    id: 'tx-005',
    description: 'Assinatura Fiel Espectador Diamond — @celeste',
    makerHandle: '@celeste',
    viewerHandle: '@rafael_vip',
    type: 'subscription',
    ...split(99.99),
    timestamp: '2026-07-06T23:10:00Z',
  },
  {
    id: 'tx-006',
    description: 'PPV desbloqueado — Editorial exclusivo da semana',
    makerHandle: '@valentina',
    viewerHandle: '@marcos_g',
    type: 'ppv',
    ...split(12.00),
    timestamp: '2026-07-06T22:05:00Z',
  },
  {
    id: 'tx-007',
    description: 'Mimo Direto na Live — USD $15 para @YourGazeHub',
    makerHandle: '@YourGazeHub',
    viewerHandle: '@espectador_sandbox',
    type: 'mimo',
    ...split(15.00),
    timestamp: '2026-07-06T21:30:00Z',
  },
]

export const sampleMessages: ChatMessage[] = [
  { id: 'c1', from: 'maker', text: 'Oi! Que bom te ver por aqui. 💎', timeLabel: 'há 2 h' },
  { id: 'c2', from: 'me',    text: 'Adorei seu último ensaio!',       timeLabel: 'há 2 h' },
  { id: 'c3', from: 'maker', text: 'Preparei algo especial pra você, só aí. 🔥', timeLabel: 'há 1 h' },
  {
    id: 'c4',
    from: 'maker',
    text: 'Sessão de treino super pesada. O final foi intenso! 🔥💦',
    timeLabel: 'há 45 min',
    media: {
      price: 'US$ 12,00',
      url:   'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop',
      type:  'photo',
    },
  },
  {
    id: 'c5',
    from: 'maker',
    text: 'Bastidores do ensaio de hoje — vídeo completo exclusivo. 🎬✨',
    timeLabel: 'há 20 min',
    media: {
      price: 'US$ 29,90',
      url:   'https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=800&auto=format&fit=crop',
      type:  'video',
    },
  },
  {
    id: 'c6',
    from: 'maker',
    text: 'Obrigada por desbloquear! Espero que tenha curtido 💛',
    timeLabel: 'há 5 min',
    media: {
      price: 'US$ 9,90',
      url:   'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?q=80&w=800&auto=format&fit=crop',
      type:  'photo',
      unlocked: true,
    },
  },
]
