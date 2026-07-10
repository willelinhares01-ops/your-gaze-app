import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

export const viewport: Viewport = {
  themeColor:   '#0A192F',   // Deep Navy Corporativo
  width:        'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://yourgaze.space'),

  title: {
    default:  'Your Gaze — Plataforma de Soberania Audiovisual & Monetização em Dólar',
    template: '%s | Your Gaze',
  },

  description:
    'A plataforma de soberania audiovisual para criadores independentes. Venda direta ao Espectador, Chat PPV, Leilões Exclusivos 1/1, verificação biométrica Yoti e repasse líquido garantido de 85% em USD ($).',

  keywords: [
    'monetização audiovisual',
    'conteúdo exclusivo em dólar',
    'repasse 85% criadores',
    'plataforma sem algoritmo',
    'leilão de conteúdo digital 1/1',
    'chat ppv desfoque',
    'mimos crowdfunding live',
    'plataforma soberana criadores',
    'your gaze hub',
  ],

  authors:   [{ name: 'Your Gaze Technologies', url: 'https://yourgaze.space' }],
  creator:   'Your Gaze Hub',
  publisher: 'Your Gaze Space Ecosystem',

  robots: {
    index:     true,
    follow:    true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },

  openGraph: {
    type:            'website',
    locale:          'pt_BR',
    alternateLocale: ['en_US', 'es_ES'],
    url:             'https://yourgaze.space',
    siteName:        'Your Gaze Space',
    title:
      'Your Gaze — Monopolize sua Audiência e Escale sua Renda em USD ($)',
    description:
      'Livre-se de algoritmos e taxas abusivas. Conecte-se diretamente aos seus Espectadores com repasse de 85%, leilões competitivos e pagamentos globais em Dólar.',
    images: [
      {
        url:    '/og-image-luxury.jpg',
        width:  1200,
        height: 630,
        alt:    'Your Gaze — See and be what others cannot.',
      },
    ],
  },

  twitter: {
    card:        'summary_large_image',
    title:       'Your Gaze — Soberania Audiovisual & Repasse de 85%',
    description:
      'Plataforma de monetização direta para criadores de elite. Chat PPV, Leilões 1/1 e recebimento em USD ($).',
    images:  ['/og-image-luxury.jpg'],
    creator: '@YourGazeHub',
  },

  alternates: {
    canonical: 'https://yourgaze.space',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`light ${geistSans.variable} ${geistMono.variable} ${cormorant.variable} bg-background`}
    >
      <head>
        <link rel="preload" as="image" href="/your-gaze-logo.png" />
      </head>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
