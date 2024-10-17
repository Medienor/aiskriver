import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Twitch Bio-generator',
  description: 'Bruk vår AI-drevne Twitch bio-generator for å lage engasjerende og unike biografier for din Twitch-kanal. Perfekt for streamere som ønsker å tiltrekke seg flere seere og forbedre sin online tilstedeværelse.',
  keywords: ['Twitch', 'bio-generator', 'AI', 'streaming', 'kanalbiografi', 'innholdsskaping', 'personlig merkevarebygging'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Twitch Bio-generator | Innhold.AI',
    description: 'Lag engasjerende Twitch-biografier med vår AI-drevne bio-generator.',
    url: 'https://innhold.ai/tools/twitch-bio-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Twitch Bio-generator | Innhold.AI',
    description: 'Lag engasjerende Twitch-biografier med vår AI-drevne bio-generator.',
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

export default function TwitchBioGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}