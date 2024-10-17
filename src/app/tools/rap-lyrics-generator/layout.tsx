import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Rap-tekst Generator',
  description: 'Bruk vår AI-drevne rap-tekst generator for å skape unike og fengende rap-tekster. Perfekt for rappere, låtskrivere og musikkentusiaster som ønsker å utforske nye kreative muligheter.',
  keywords: ['rap-tekst', 'AI', 'låtskriving', 'musikk', 'kreativitet', 'hip-hop'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Rap-tekst Generator | Innhold.AI',
    description: 'Skap unike og fengende rap-tekster med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/rap-lyrics-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Rap-tekst Generator | Innhold.AI',
    description: 'Skap unike og fengende rap-tekster med vår AI-drevne generator.',
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

export default function RapLyricsGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}