import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://yourgaze.space'

  return [
    {
      url:             baseUrl,
      lastModified:    new Date(),
      changeFrequency: 'daily',
      priority:        1.0,   // Página pública de entrada (branca)
    },
    {
      url:             `${baseUrl}/maker-space`,
      lastModified:    new Date(),
      changeFrequency: 'weekly',
      priority:        0.9,   // Página Institucional do Maker (Your Gaze Hub)
    },
    {
      url:             `${baseUrl}/onboarding`,
      lastModified:    new Date(),
      changeFrequency: 'monthly',
      priority:        0.8,   // Funil de conversão e KYC
    },
  ]
}
