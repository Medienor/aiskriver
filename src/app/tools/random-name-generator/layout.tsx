import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Navngenerator',
  description: 'Bruk vår AI-drevne navngenerator for å skape unike og kreative navn. Perfekt for forfattere, spillutviklere og foreldre som leter etter inspirasjon til karakterer eller babynavn.',
  keywords: ['navngenerator', 'AI', 'kreative navn', 'karakternavn', 'babynavn', 'tilfeldig navn'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Navngenerator | Innhold.AI',
    description: 'Generer unike og kreative navn med vår AI-drevne navngenerator.',
    url: 'https://innhold.ai/tools/random-name-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Navngenerator | Innhold.AI',
    description: 'Generer unike og kreative navn med vår AI-drevne navngenerator.',
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

export default function RandomNameGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}