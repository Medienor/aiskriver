import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Sangtekstgenerator',
  description: 'Bruk vår AI-drevne sangtekstgenerator for å skape unike og kreative sangtekster. Perfekt for musikere, låtskrivere og kreative sjeler som ønsker inspirasjon til nye sanger.',
  keywords: ['sangtekst', 'AI', 'generator', 'låtskriving', 'musikk', 'kreativitet'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Sangtekstgenerator | Innhold.AI',
    description: 'Skap unike og kreative sangtekster med vår AI-drevne sangtekstgenerator.',
    url: 'https://innhold.ai/tools/song-lyrics-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Sangtekstgenerator | Innhold.AI',
    description: 'Skap unike og kreative sangtekster med vår AI-drevne sangtekstgenerator.',
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

export default function SongLyricsGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}