import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Historiegenerator',
  description: 'Bruk vår AI-drevne historiegenerator for å skape unike og engasjerende fortellinger. La kreativiteten blomstre med intelligent tekstgenerering.',
  keywords: ['historiegenerator', 'AI', 'kreativ skriving', 'fortellinger', 'tekstgenerering', 'fiksjon'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Historiegenerator | Innhold.AI',
    description: 'Skap unike og engasjerende fortellinger med vår AI-drevne historiegenerator.',
    url: 'https://innhold.ai/tools/ai-story-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Historiegenerator | Innhold.AI',
    description: 'Skap unike og engasjerende fortellinger med vår AI-drevne historiegenerator.',
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

export default function AIStoryGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}