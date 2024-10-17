import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Sangtekstgenerator',
  description: 'Bruk vår AI-drevne sangtekstgenerator for å skape unike og inspirerende sangtekster. Perfekt for musikere, låtskrivere og kreative sjeler som ønsker å utforske nye musikalske ideer.',
  keywords: ['sangtekster', 'AI', 'generator', 'musikk', 'låtskriving', 'kreativitet'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Sangtekstgenerator | Innhold.AI',
    description: 'Skap unike og inspirerende sangtekster med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/lyrics-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Sangtekstgenerator | Innhold.AI',
    description: 'Skap unike og inspirerende sangtekster med vår AI-drevne generator.',
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

export default function LyricsGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}