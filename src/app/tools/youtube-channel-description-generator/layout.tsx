import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI YouTube-kanalbeskrivelse Generator',
  description: 'Bruk vår AI-drevne generator for å lage engasjerende og effektive YouTube-kanalbeskrivelser. Perfekt for innholdsskapere som ønsker å optimalisere sin kanalsynlighet og tiltrekke flere abonnenter.',
  keywords: ['YouTube', 'kanalbeskrivelse', 'AI', 'innholdsskaping', 'SEO', 'videomarkedsføring'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI YouTube-kanalbeskrivelse Generator | Innhold.AI',
    description: 'Lag engasjerende YouTube-kanalbeskrivelser med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/youtube-channel-description-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI YouTube-kanalbeskrivelse Generator | Innhold.AI',
    description: 'Lag engasjerende YouTube-kanalbeskrivelser med vår AI-drevne generator.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function YouTubeChannelDescriptionGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}