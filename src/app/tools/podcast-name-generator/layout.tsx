import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Podcast Navngenerator',
  description: 'Bruk vår AI-drevne podcast navngenerator for å skape unike og fengende navn til din podcast. Perfekt for podcastere, innholdsskapere og kreative sjeler som ønsker å skille seg ut i podcastverdenen.',
  keywords: ['podcast navn', 'AI', 'navngenerator', 'kreativitet', 'innholdsskaping', 'podcastutvikling'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Podcast Navngenerator | Innhold.AI',
    description: 'Skap unike og fengende podcastnavn med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/podcast-name-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Podcast Navngenerator | Innhold.AI',
    description: 'Skap unike og fengende podcastnavn med vår AI-drevne generator.',
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

export default function PodcastNameGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}