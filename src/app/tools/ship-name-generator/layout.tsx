import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Skipsnavn Generator',
  description: 'Bruk vår AI-drevne skipsnavn generator for å skape unike og passende navn til ditt fartøy. Perfekt for båteiere, maritime entusiaster og forfattere som trenger inspirasjon til skipsnavn.',
  keywords: ['skipsnavn', 'AI', 'navngenerator', 'båtnavn', 'maritime', 'fartøynavn'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Skipsnavn Generator | Innhold.AI',
    description: 'Generer unike og kreative skipsnavn med vår AI-drevne navngenerator.',
    url: 'https://innhold.ai/tools/ship-name-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Skipsnavn Generator | Innhold.AI',
    description: 'Generer unike og kreative skipsnavn med vår AI-drevne navngenerator.',
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

export default function ShipNameGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}