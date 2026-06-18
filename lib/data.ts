export type Maker = {
  id: string
  name: string
  handle: string
  avatar: string
}

export const currentUser = {
  name: 'Você',
  handle: '@voce',
  avatar: '/avatar-user.png',
  role: 'Espectador' as const,
}

// Maker logado na visão "Maker" (Feed & Histórico mostra apenas os posts dele)
export const currentMaker: Maker = {
  id: 'm1',
  name: 'Valentina',
  handle: '@valentina',
  avatar: '/avatar-maker-1.png',
}

export const makers: Maker[] = [
  { id: 'm1', name: 'Valentina', handle: '@valentina', avatar: '/avatar-maker-1.png' },
  { id: 'm2', name: 'Aurora', handle: '@aurora', avatar: '/avatar-maker-2.png' },
  { id: 'm3', name: 'Celeste', handle: '@celeste', avatar: '/avatar-maker-3.png' },
  { id: 'm4', name: 'Bianca', handle: '@bianca', avatar: '/avatar-maker-4.png' },
  { id: 'm5', name: 'Lívia', handle: '@livia', avatar: '/avatar-maker-5.png' },
]

export type Post = {
  id: string
  maker: Maker
  image: string
  caption: string
  likes: number
  tier: 'Premium' | 'Premium Gold' | 'Premium Diamond'
  // views = quantas vezes a postagem foi vista (ranqueia "Em Alta")
  views: number
  // sales = assinaturas + conteúdos avulsos que esta postagem ajudou a vender
  sales: number
  // minutos atrás da publicação (quanto menor, mais recente — ranqueia "Recente")
  minsAgo: number
}

export const posts: Post[] = [
  {
    id: 'p1',
    maker: makers[0],
    image: '/post-1.png',
    caption: 'Editorial exclusivo da semana.',
    likes: 1284,
    tier: 'Premium Gold',
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
    views: 12800,
    sales: 58,
    minsAgo: 30,
  },
]

export const tiers = [
  {
    name: 'Premium',
    price: 'R$ 49',
    perks: ['Feed liberado', 'Degustação sem blur', 'Chat com o Maker'],
  },
  {
    name: 'Premium Gold',
    price: 'R$ 99',
    perks: ['Tudo do Premium', 'Lives e Grupos VIP', 'Mídias avulsas com desconto'],
  },
  {
    name: 'Premium Diamond',
    price: 'R$ 199',
    perks: ['Tudo do Gold', 'PPV ilimitado', 'Prioridade no chat e leilões'],
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
  media?: { price: string }
}

export const chatThreads = makers.slice(0, 3).map((m, i) => ({
  maker: m,
  lastMessage: ['Oi! Tenho novidades pra você 💎', 'Veja meu novo PPV', 'Bom dia, amor!'][i],
  unread: [2, 0, 1][i],
}))

export const sampleMessages: ChatMessage[] = [
  { id: 'c1', from: 'maker', text: 'Oi! Que bom te ver por aqui.' },
  { id: 'c2', from: 'me', text: 'Adorei seu último ensaio!' },
  { id: 'c3', from: 'maker', text: 'Preparei um conteúdo exclusivo pra você.' },
  { id: 'c4', from: 'maker', text: 'Mídia exclusiva', media: { price: 'US$ 12,00' } },
]
