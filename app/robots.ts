import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/maker-space', '/onboarding'],
      disallow: [
        '/app/*',       // Protege a área logada e galeria de consumo
        '/api/*',       // Bloqueia endpoints de backend
        '/checkout/*',  // Impede indexação de gateways de pagamento
        '/*?step=*',    // Evita conteúdo duplicado com parâmetros de querystring
      ],
    },
    sitemap: 'https://yourgaze.space/sitemap.xml',
  }
}
